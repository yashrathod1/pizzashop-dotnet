using System.ComponentModel.DataAnnotations;

namespace pizzashop_repository.ViewModels;

public class TaxsAndFeesViewModel
{
    public int Id { get; set; }
    
    [Required(ErrorMessage = "Name is required")]
    [MinLength(3, ErrorMessage = "Name must be at least 3 characters long")]
    public string Name { get; set; } = null!;

    [Required(ErrorMessage = "Tax Type is required")]
    public string Type { get; set; } = null!;

    [Required(ErrorMessage = "Tax Amount is required")]
    [Range(0, double.MaxValue, ErrorMessage = "Tax Amount must be greater than or equal to 0")]
    public decimal Value { get; set; }
    public bool IsEnabled { get; set; } 
    public bool IsDefault { get; set; } 
    public bool IsDeleted { get; set; }

}
