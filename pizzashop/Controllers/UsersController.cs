using Microsoft.AspNetCore.Mvc;
using pizzashop_repository.Models;
using pizzashop_repository.ViewModels;
using pizzashop_service.Implementation;
using pizzashop_service.Interface;

namespace pizzashop.Controllers;


public class UsersController : Controller
{
    private readonly IUserService _userService;
    private readonly IEmailSender _emailSender;

    public UsersController(IUserService userService, IEmailSender emailSender)
    {
        _userService = userService;
        _emailSender = emailSender;
    }

    [CustomAuthorize("Users", "CanView")]
    [HttpGet("ListUsers")]
    public IActionResult UsersList(string searchTerm = "", int page = 1, int pageSize = 5, string sortBy = "Name", string sortOrder = "asc")
    {
        var paginatedUsers = _userService.GetUsers(searchTerm, page, pageSize, sortBy, sortOrder);

        if (Request.Headers["X-Requested-With"] == "XMLHttpRequest")
        {
            return PartialView("_UsersList", paginatedUsers);
        }

        return View(paginatedUsers);
    }

    [CustomAuthorize("Users", "CanDelete")]
    [HttpGet("Delete/{id}")]
    public IActionResult DeleteUser(int id)
    {
        bool isDeleted = _userService.DeleteUser(id);
        if (!isDeleted)
        {
            return NotFound();
        }
         TempData["success"] = "User deleted successfully";
        return RedirectToAction("UsersList");
    }

    [HttpGet("AddUser")]
    public IActionResult AddUser()
    {
        ViewBag.Roles = _userService.GetRoles();
        return View();
    }

    [CustomAuthorize("Users", "CanAddEdit")]
    [HttpPost("AddUser")]
    public async Task<IActionResult> AddUser([FromForm] AddUserViewModel model)
    {
        ViewBag.Roles = _userService.GetRoles();


        var emailverify = _userService.GetUserByEmail(model.Email);
        if (emailverify != null)
        {
            TempData["error"] = "Account already exits with Email";
            return View(model);
        }

        var usernameverify = _userService.GetUserByUsername(model.Username);
        if (usernameverify != null)
        {
            TempData["error"] = "Account already exits with username";
            return View(model);
        }

        if (!ModelState.IsValid) // Check if ModelState has errors
        {
            var errors = ModelState.Values.SelectMany(v => v.Errors)
                                          .Select(e => e.ErrorMessage)
                                          .ToList();

            return BadRequest(new { success = false, errors }); // Return errors as JSON
        }

        if (ModelState.IsValid)
        {
            bool isAdded = await _userService.AddUser(model);
            // string filePath = @"D:/3tierpizzashop/pizzashop/Template/AddNewUserEmailTemplate.html";
            // string emailBody = System.IO.File.ReadAllText(filePath);
            // emailBody = emailBody.Replace("{Email}", model.Email);
            // emailBody = emailBody.Replace("{Password}", model.Password);

            // string subject = "Your Login Details";
            // _emailSender.SendEmailAsync(model.Email, subject, emailBody);
            if (isAdded)
            {
            TempData["success"] = "User Successfully Added";
                return RedirectToAction("UsersList", "Users");
            }

            ModelState.AddModelError("", "Failed to add user. Role may not exist.");
        }



        return View(model);
    }

    [HttpGet("EditUser/{id}")]
    public IActionResult EditUser(int id)
    {
        var model = _userService.GetUserForEdit(id);
        if (model == null)
        {
            return NotFound();
        }

        ViewBag.Roles = _userService.GetRoles();
        return View(model);
    }

    [CustomAuthorize("Users", "CanAddEdit")]
    [HttpPost("EditUser/{id}")]
    public async Task<IActionResult> EditUser([FromForm] EditUserViewModel model, int id)
    {
        if (!ModelState.IsValid)
        {
            ViewBag.Roles = _userService.GetRoles();
            return View(model);
        }

        bool isUpdated = await _userService.EditUser(id, model);
        if (!isUpdated)
        {
             TempData["error"] = "No Change Found Please Update the User";
             ViewBag.Roles = _userService.GetRoles();
             return View(model);
        }
        TempData["success"] = "User Successfully Edited";
        return RedirectToAction("UsersList");
    }
}
