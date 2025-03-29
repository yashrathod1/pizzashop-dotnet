using pizzashop_repository.Interface;
using pizzashop_repository.Models;
using pizzashop_repository.ViewModels;
using pizzashop_service.Interface;

namespace pizzashop_service.Implementation;

public class TableAndSectionService : ITableAndSectionService
{
    private readonly ITableAndSectionRepository _tableAndSectionRepository;

    public TableAndSectionService(ITableAndSectionRepository tableAndSectionRepository)
    {
        _tableAndSectionRepository = tableAndSectionRepository;
    }

    public async Task<List<SectionsViewModal>> GetSectionsAsync()
    {
        return await _tableAndSectionRepository.GetSectionsAsync();
    }

    public async Task<PagedResult<TableViewModel>> GetTableBySectionAsync(int SectionId, int pageNumber, int pageSize, string searchTerm = "")
    {
        return await _tableAndSectionRepository.GetTableBySectionAsync(SectionId, pageNumber, pageSize, searchTerm);
    }

    public async Task<Section> AddSectionAsync(string name, string description)
    {
        var section = new Section { Name = name, Description = description };
        return await _tableAndSectionRepository.AddSectionAsync(section);
    }


    public async Task<SectionsViewModal> GetSectionById(int id)
    {
        return await _tableAndSectionRepository.GetSectionByIdAsync(id);
    }

    public async Task<bool> UpdateSectionAsync(SectionsViewModal section)
    {
        return await _tableAndSectionRepository.UpdateSectionAsync(section);
    }

    public async Task<bool> SoftDeleteSectionAsync(int id)
    {
        return await _tableAndSectionRepository.SoftDeleteSectionAsync(id);
    }

    public async Task<bool> AddTableAsync(TableViewModel model)
    {

        var newTable = new Table
        {
            Name = model.Name,
            Capacity = model.Capacity,
            Status = model.Status,
            Sectionid = model.SectionId,
            Isdeleted = model.Isdeleted

        };

        return await _tableAndSectionRepository.AddTableAsync(newTable);
    }

    public async Task<TableViewModel> GetTableById(int id)
    {
        return await _tableAndSectionRepository.GetTableById(id);
    }

    public async Task<Table?> GetTableByNameAsync(string name)
    {
        return await _tableAndSectionRepository.GetTableByNameAsync(name);
    }

    public async Task<bool> UpdateTableAsync(TableViewModel model)
    {
        var table = await _tableAndSectionRepository.GetTableByIdForEdit(model.Id);
        if (table == null) return false;

        table.Name = model.Name;
        table.Sectionid = model.SectionId;
        table.Capacity = model.Capacity;
        table.Status = model.Status;

        return await _tableAndSectionRepository.UpdateTableAsync(table);
    }

    public async Task<bool> SoftDeleteTableAsync(int id)
    {
        return await _tableAndSectionRepository.SoftDeleteTableAsync(id);
    }

      public void SoftDeleteTablesAsync(List<int> tableIds)
    {
        _tableAndSectionRepository.SoftDeleteTablesAsync(tableIds);
    }
}
