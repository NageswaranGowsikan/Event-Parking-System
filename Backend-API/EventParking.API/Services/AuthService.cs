using EventParking.API.DTOs;
using EventParking.API.Interfaces;
using EventParking.API.Models;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Text;
using static EventParking.API.DTOs.AuthDTOs;

namespace EventParking.API.Services
{
    public class AuthService
    {
        private readonly ICustomerRepository _customerRepository;
        private readonly IConfiguration _config;

        public AuthService(ICustomerRepository customerRepository, IConfiguration config)
        {
            _customerRepository = customerRepository;
            _config = config;
        }


        public async Task<AuthResponseDto> RegisterAsync(RegisterDto dto)
        {
            // Rule: Customer emails must be unique
            if (await _customerRepository.GetByEmailAsync(dto.Email) != null)
                throw new Exception("Email is already registered.");

            var customer = new Customer
            {
                Name = dto.Name,
                Email = dto.Email,
                Phone = dto.Phone,
                PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password),
                EmailVerificationToken = GenerateSecureToken(),
                EmailVerificationTokenExpiresAt = DateTime.UtcNow.AddHours(24)
            };

            await _customerRepository.AddAsync(customer);
            return new AuthResponseDto(string.Empty, "Registration successful. Please verify your email.");
        }

        public async Task<AuthResponseDto> LoginAsync(LoginDto dto)
        {
            var customer = await _customerRepository.GetByEmailAsync(dto.Email);

            if (customer == null || !BCrypt.Net.BCrypt.Verify(dto.Password, customer.PasswordHash))
                throw new Exception("Invalid email or password.");

            if (!customer.EmailVerified)
                throw new Exception("Please verify your email address before logging in.");

            if (customer.Status == "Deactivated")
                throw new Exception("Your account has been deactivated. Please contact support.");

            var token = GenerateJwtToken(customer);
            return new AuthResponseDto(token, customer.Id.ToString());
        }

        public async Task<bool> VerifyEmailAsync(string token)
        {
            var customer = await _customerRepository.GetByVerificationTokenAsync(token);
            if (customer == null || customer.EmailVerificationTokenExpiresAt < DateTime.UtcNow)
                return false;

            customer.EmailVerified = true;
            customer.EmailVerificationToken = null;
            customer.EmailVerificationTokenExpiresAt = null;
            customer.Status = "Active";

            await _customerRepository.UpdateAsync(customer);
            return true;
        }

        public async Task ForgotPasswordAsync(ForgotPasswordDto dto)
        {
            var customer = await _customerRepository.GetByEmailAsync(dto.Email);
            if (customer != null)
            {
                customer.PasswordResetToken = GenerateSecureToken();
                customer.PasswordResetTokenExpiresAt = DateTime.UtcNow.AddMinutes(60);
                await _customerRepository.UpdateAsync(customer);
                // Email service integration goes here
            }
        }

        public async Task ResetPasswordAsync(ResetPasswordDto dto)
        {
            var customer = await _customerRepository.GetByResetTokenAsync(dto.Token);
            if (customer == null || customer.PasswordResetTokenExpiresAt < DateTime.UtcNow)
                throw new Exception("Invalid or expired reset token.");

            customer.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
            customer.PasswordResetToken = null;
            customer.PasswordResetTokenExpiresAt = null;

            await _customerRepository.UpdateAsync(customer);
        }

        private string GenerateSecureToken()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
                .Replace("+", "-").Replace("/", "_").TrimEnd('=');
        }

        private string GenerateJwtToken(Customer customer)
        {
            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(JwtRegisteredClaimNames.Sub, customer.Id.ToString()),
                new Claim(JwtRegisteredClaimNames.Email, customer.Email),
                new Claim(ClaimTypes.Role, "Customer") // Use "Admin" logic if building dual-roles
            };

            var token = new JwtSecurityToken(
                issuer: _config["Jwt:Issuer"],
                audience: _config["Jwt:Audience"],
                claims: claims,
                expires: DateTime.UtcNow.AddHours(2),
                signingCredentials: credentials);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }
    }
}
