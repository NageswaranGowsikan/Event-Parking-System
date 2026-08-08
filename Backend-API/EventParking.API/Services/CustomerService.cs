using EventParking.API.Interfaces;
using static EventParking.API.DTOs.CustomerDTOs;

namespace EventParking.API.Services
{
    public class CustomerService
    {
        private readonly ICustomerRepository _customerRepository;

        public CustomerService(ICustomerRepository customerRepository)
        {
            _customerRepository = customerRepository;
        }

        public async Task<CustomerProfileDto> GetProfileAsync(int customerId)
        {
            var customer = await _customerRepository.GetByIdAsync(customerId);
            if (customer == null) throw new Exception("Customer not found");

            return new CustomerProfileDto(customer.Id, customer.Name, customer.Email, customer.Phone, customer.Status);
        }

        public async Task DeactivateCustomerAsync(int customerId)
        {
            var customer = await _customerRepository.GetByIdAsync(customerId);
            if (customer == null) throw new Exception("Customer not found");

            // TODO: Call IBookingRepository here to check for active future bookings (Module 6 dependency)
            // if (await _bookingRepo.HasActiveFutureBookings(customerId)) 
            //     throw new Exception("Cannot deactivate: Customer has active future bookings.");

            customer.Status = "Deactivated";
            await _customerRepository.UpdateAsync(customer);
        }
    }
}
