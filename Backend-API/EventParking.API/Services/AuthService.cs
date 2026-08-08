using EventParking.API.Interfaces;
using EventParking.API.Models;
using System.Security.Cryptography;
using static EventParking.API.DTOs.AuthDTOs;

namespace EventParking.API.Services
{
    public class AuthService
    {
        private readonly ICustomerRepository _customerRepository;

        public AuthService(ICustomerRepository customerRepository)
        {
            _customerRepository = customerRepository;
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

            // In a real app, you would inject an IEmailService here and send the email
            // _emailService.SendVerificationEmail(customer.Email, customer.EmailVerificationToken);

            return new AuthResponseDto(null, "Registration successful. Please verify your email.");
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

        // Generate a cryptographically secure random token for emails
        private string GenerateSecureToken()
        {
            return Convert.ToBase64String(RandomNumberGenerator.GetBytes(32))
                .Replace("+", "-").Replace("/", "_").TrimEnd('=');
        }
    }
}
