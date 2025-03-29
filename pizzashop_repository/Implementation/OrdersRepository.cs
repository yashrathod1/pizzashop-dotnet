using Microsoft.EntityFrameworkCore;
using pizzashop_repository.Database;
using pizzashop_repository.Interface;
using pizzashop_repository.Models;
using pizzashop_repository.ViewModels;

namespace pizzashop_repository.Implementation;

public class OrdersRepository : IOrdersRepository
{
    private readonly PizzaShopDbContext _context;

    public OrdersRepository(PizzaShopDbContext context)
    {
        _context = context;
    }

    public async Task<PagedResult<OrdersTableViewModel>> GetOrdersAsync(int pageNumber, int pageSize, string sortBy, string sortOrder, string searchTerm = "", string status = "All", string dateRange = "All time", string fromDate = "", string toDate = "")
    {
        var query = _context.Orders.Include(o => o.Customer).Include(o => o.Payments).AsQueryable();

        if (!string.IsNullOrWhiteSpace(searchTerm) && int.TryParse(searchTerm, out int searchId)  )
        {
            query = query.Where(i => i.Id == searchId || i.Customer.Name.ToLower().Contains(searchTerm.ToLower()));
        }

        if (!string.IsNullOrEmpty(status) && status != "All")
        {
            query = query.Where(o => o.Status == status);
        }

        // Apply date range filter
        if (!string.IsNullOrEmpty(dateRange) && dateRange != "All time")
        {
            DateTime now = DateTime.Now;
            DateTime startDate = now;

            switch (dateRange)
            {
                case "Last 7 days":
                    startDate = now.AddDays(-7);
                    break;
                case "Last 30 days":
                    startDate = now.AddDays(-30);
                    break;
                case "Current Month":
                    startDate = new DateTime(now.Year, now.Month, 1);
                    break;
            }

            query = query.Where(o => o.Createdat >= startDate);
        }

        // Apply custom date filter
        if (!string.IsNullOrEmpty(fromDate) && DateTime.TryParse(fromDate, out DateTime from))
        {
            query = query.Where(o => o.Createdat >= from);
        }

        if (!string.IsNullOrEmpty(toDate) && DateTime.TryParse(toDate, out DateTime to))
        {
            query = query.Where(o => o.Createdat <= to);
        }

        query = sortBy switch
        {
            "Id" => sortOrder == "asc"
                ? query.OrderBy(u => u.Id)
                : query.OrderByDescending(u => u.Id),

            "CustomerName" => sortOrder == "asc"
                ? query.OrderBy(u => u.Customer.Name)
                : query.OrderByDescending(u => u.Customer.Name),

            "OrderDate" => sortOrder == "asc"
                ? query.OrderBy(u => u.Createdat)
                : query.OrderByDescending(u => u.Createdat),

            "TotalAmount" => sortOrder == "asc"
                ? query.OrderBy(u => u.Totalamount)
                : query.OrderByDescending(u => u.Totalamount),

            _ => query.OrderBy(u => u.Id) // Default sorting by ID
        };

        int totalCount = await query.CountAsync();

        var orders = await query
            .Skip((pageNumber - 1) * pageSize)
            .Take(pageSize)
            .Select(t => new OrdersTableViewModel
            {
                Id = t.Id,
                OrderDate = t.Createdat,
                CustomerName = t.Customer.Name,
                PaymentMethod = _context.Payments.Where(p => p.Orderid == t.Id).Select(p => p.PaymentMethod).FirstOrDefault(),
                Status = t.Status,
                Rating = t.Rating,
                TotalAmount = t.Totalamount,


            }).ToListAsync();

        return new PagedResult<OrdersTableViewModel>(orders, pageNumber, pageSize, totalCount);
    }

    public List<OrdersTableViewModel> GetOrders(string status, string dateRange, string searchTerm)
    {
        var query = from o in _context.Orders
                    join c in _context.Customers on o.Customerid equals c.Id
                    join p in _context.Payments on o.Paymentid equals p.Id
                    select new OrdersTableViewModel
                    {
                        Id = o.Id,
                        OrderDate = o.Createdat,
                        CustomerName = c.Name,
                        Status = o.Status,
                        PaymentMethod = p.PaymentMethod,
                        Rating = o.Rating,
                        TotalAmount = p.Amount
                    };

        if (!string.IsNullOrEmpty(status) && status != "All")
        {
            query = query.Where(o => o.Status == status);
        }

        if (!string.IsNullOrEmpty(dateRange) && dateRange != "All time")
        {
            DateTime now = DateTime.Now;
            DateTime startDate = now;

            switch (dateRange)
            {
                case "Last 7 days":
                    startDate = now.AddDays(-7);
                    break;
                case "Last 30 days":
                    startDate = now.AddDays(-30);
                    break;
                case "Current Month":
                    startDate = new DateTime(now.Year, now.Month, 1);
                    break;
            }

            query = query.Where(o => o.OrderDate >= startDate);
        }

        if (!string.IsNullOrWhiteSpace(searchTerm) && int.TryParse(searchTerm, out int searchId))
        {
            query = query.Where(i => i.Id == searchId);
        }

        return query.ToList();
    }

    public async Task<Order?> GetOrderWithDetailsAsync(int orderId)
    {
        return await _context.Orders
            .Include(o => o.Customer)
            .Include(o => o.Table)
                .ThenInclude(o => o.Section)
            .Include(o => o.Payments)
            .Include(o => o.OrderItemsMappings)
                .ThenInclude(o => o.OrderItemModifiers)
            .Include(o => o.OrderTaxesMappings)
            .Include(o => o.Invoices)
            .FirstOrDefaultAsync(o => o.Id == orderId);
    }

}







