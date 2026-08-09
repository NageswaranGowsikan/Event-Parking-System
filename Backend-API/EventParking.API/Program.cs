using Microsoft.EntityFrameworkCore;
using EventParking.API.Data;
using EventParking.API.Interfaces;
using EventParking.API.Repositories;
using EventParking.API.Services;

var builder = WebApplication.CreateBuilder(args);

// 1. Add CORS (For your frontend team later)
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowFrontend", policy =>
    {
        policy.WithOrigins("http://127.0.0.1:5500", "http://localhost:5500")
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 2. Register the Database Context
builder.Services.AddDbContext<AppDbContext>(options =>
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection")));

// 3. Register Repositories and Services for Dependency Injection
builder.Services.AddScoped<ICustomerRepository, CustomerRepository>();
builder.Services.AddScoped<AuthService>();
builder.Services.AddScoped<CustomerService>();

builder.Services.AddScoped<IBookingRepository, BookingRepository>();
builder.Services.AddScoped<IBookingService, BookingService>();

builder.Services.AddControllers();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();

var app = builder.Build();

// 4. Configure the HTTP request pipeline
if (app.Environment.IsDevelopment())
{
    app.UseSwagger();
    app.UseSwaggerUI();
}

app.UseHttpsRedirection();
app.UseCors("AllowFrontend");
app.UseAuthorization();
app.MapControllers();
app.Run();