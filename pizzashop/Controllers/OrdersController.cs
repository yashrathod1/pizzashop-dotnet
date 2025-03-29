using System.Security.Cryptography.Pkcs;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore.Metadata.Internal;
using pizzashop_service.Interface;

namespace pizzashop.Controllers;

public class OrdersController : Controller
{
    private readonly IOredersService _oredersService;

    public OrdersController(IOredersService oredersService)
    {
        _oredersService = oredersService;
    }

    public IActionResult Index()
    {
        return View();
    }

    [HttpGet]
    public async Task<IActionResult> GetOrders(int pageNumber = 1, int pageSize = 5, string sortBy = "Id", string sortOrder = "asc", string searchTerm = "", string status = "All", string dateRange = "All time", string fromDate = "", string toDate = "")
    {
        var pagedItems = await _oredersService.GetOrdersAsync(pageNumber, pageSize, sortBy, sortOrder, searchTerm, status, dateRange, fromDate, toDate);
        return PartialView("_OrderTablePartial", pagedItems);
    }

    [HttpGet]
    public IActionResult ExportOrders(string status, string date, string searchText)
    {
        // Ensure valid parameters
        status = status ?? "";
        date = date ?? "";
        searchText = searchText ?? "";

        // Generate Excel file
        byte[] fileContent = _oredersService.GenerateExcel(status, date, searchText);

        if (fileContent == null || fileContent.Length == 0)
        {
            return BadRequest("Failed to generate Excel file.");
        }

        string fileName = $"Orders_{DateTime.Now:yyyyMMdd_HHmmss}.xlsx";
        return File(fileContent,
                    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
                    fileName);
    }

    public async Task<IActionResult> OrderDetails(int id)
    {
        var orderDetails = await _oredersService.GetOrderDetailsAsync(id);
        if (orderDetails == null)
        {
            return NotFound();
        }
        return View(orderDetails);
    }
}
