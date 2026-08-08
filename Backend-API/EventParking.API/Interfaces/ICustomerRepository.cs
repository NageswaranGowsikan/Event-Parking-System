using EventParking.API.Models;

namespace EventParking.API.Interfaces
{
    public interface ICustomerRepository
    {
        Task<Customer?> GetByIdAsync(int id);
        Task<Customer?> GetByEmailAsync(string email);
        Task<Customer?> GetByVerificationTokenAsync(string token);
        Task<Customer?> GetByResetTokenAsync(string token);
        Task AddAsync(Customer customer);
        Task UpdateAsync(Customer customer);
    }
}
