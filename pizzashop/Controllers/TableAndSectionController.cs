using Microsoft.AspNetCore.Mvc;
using pizzashop_repository.ViewModels;
using pizzashop_service.Interface;

namespace pizzashop.Controllers;

public class TableAndSectionController : Controller
{
    private readonly ITableAndSectionService _tableAndSectionService;

    public TableAndSectionController(ITableAndSectionService tableAndSectionService)
    {
        _tableAndSectionService = tableAndSectionService;
    }

    public async Task<IActionResult> Index()
    {
        var sections = await _tableAndSectionService.GetSectionsAsync();

        sections = sections.OrderBy(c => c.Id).ToList();

        var viewmodel = new TableAndSectionViewModel
        {
            Sections = sections
        };
        return View(viewmodel);
    }

    [HttpGet]
    public async Task<IActionResult> GetSections()
    {
        var sections = await _tableAndSectionService.GetSectionsAsync();

        sections = sections.OrderBy(c => c.Id).ToList();
        return PartialView("_SectionsPartial", sections);
    }

    [HttpGet]
    public async Task<IActionResult> GetTableBySection(int SectionId = 1, int pageNumber = 1, int pageSize = 5, string searchTerm = "")
    {
        var tables = await _tableAndSectionService.GetTableBySectionAsync(SectionId, pageNumber, pageSize, searchTerm);
        return PartialView("_TableListPartial", tables);
    }

    [HttpPost]
    public async Task<IActionResult> AddSection([FromBody] SectionsViewModal model)
    {
        if (string.IsNullOrWhiteSpace(model.Name))
        {
            return Json(new { success = false, message = "Section name is required" });
        }
        var section = await _tableAndSectionService.AddSectionAsync(model.Name, model.Description);
        return Json(new { success = true, section });
    }

    [HttpGet]
    public async Task<IActionResult> GetSectionById(int id)
    {
        var model = await _tableAndSectionService.GetSectionById(id);
        if (model != null)
        {
            return Json(model);
        }
        return Json(null);
    }

    [HttpPut]
    public async Task<IActionResult> UpdateSection([FromBody] SectionsViewModal model)
    {
        if (model == null || model.Id == 0)
        {
            return BadRequest(new { success = false, message = "Invalid Section Data." });
        }

        bool result = await _tableAndSectionService.UpdateSectionAsync(model);

        if (result)
        {
            return Ok(new { success = true, message = "Section updated successfully." });
        }
        else
        {
            return BadRequest(new { success = false, message = "Failed to update category." });
        }
    }


    [HttpPost]
    public async Task<IActionResult> DeleteSections([FromBody] SectionsViewModal request)
    {
        bool result = await _tableAndSectionService.SoftDeleteSectionAsync(request.Id);
        return result ? Ok(new { success = true }) : BadRequest(new { success = false });
    }

    [HttpPost]
    public async Task<IActionResult> AddTable(TableViewModel model)
    {
        if (!ModelState.IsValid)
        {

            var errors = ModelState.SelectMany(x => x.Value.Errors)
                               .Select(x => x.ErrorMessage)
                               .ToList();
            foreach (var error in errors)
            {
                Console.WriteLine("Error: " + error);
            }
            return Json(new { success = false, message = "Invalid data provided." });
        }

        var existingTable = await _tableAndSectionService.GetTableByNameAsync(model.Name);
        if (existingTable != null)
        {
            return Json(new { success = false, message = "A table with this name already exists." });
        }

        var result = await _tableAndSectionService.AddTableAsync(model);

        if (result)
        {
            return Json(new { success = true, message = "Table added successfully." });
        }
        else
        {
            return Json(new { success = false, message = "Failed to add Table." });
        }
    }

    [HttpGet]
    public async Task<IActionResult> GetTableById(int id)
    {
        var table = await _tableAndSectionService.GetTableById(id);

        if (table == null)
        {
            return NotFound();
        }

        return Json(table);
    }

    [HttpPost]
    public async Task<IActionResult> EditTable([FromBody] TableViewModel model)
    {
        if (!ModelState.IsValid)
        {
            return Json(new
            {
                success = false,
                message = "Invalid data provided.",
                errors = ModelState.Values.SelectMany(v => v.Errors).Select(e => e.ErrorMessage)
            });
        }

        var result = await _tableAndSectionService.UpdateTableAsync(model);

        if (!result)
        {
            return Json(new { success = false, message = "An error occurred while updating the table." });
        }

        return Json(new { success = true, message = "Table updated successfully!" });
    }

    [HttpPost]
    public async Task<IActionResult> DeleteTable([FromBody] TableViewModel request)
    {
        bool result = await _tableAndSectionService.SoftDeleteTableAsync(request.Id);
        return result ? Ok(new { success = true }) : Json(new { success = false });
    }


    public IActionResult SoftDeleteTables([FromBody] List<int> tableIds)
    {
        if (tableIds == null || tableIds.Count == 0)
        {
            return Json(new { success = false, message = "No item Selected" });
        }

        _tableAndSectionService.SoftDeleteTablesAsync(tableIds);
        return Json(new { success = true });
    }

}
