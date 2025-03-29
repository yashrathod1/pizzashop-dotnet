
using Microsoft.EntityFrameworkCore;
using pizzashop_repository.Database;
using pizzashop_repository.Interface;
using pizzashop_repository.Models;
using pizzashop_repository.ViewModels;

namespace pizzashop_repository.Implementation;

public class UserRepository : IUserRepository
{
    private readonly PizzaShopDbContext _context;

    public UserRepository(PizzaShopDbContext context)
    {
        _context = context;
    }

    public User? GetUserByEmail(string email)
    {
        return _context.Users.FirstOrDefault(u => u.Email == email);
    }

    public User? GetUserByUsername(string username)
    {
        return _context.Users.FirstOrDefault(u => u.Username == username);
    }

    public User GetUserByResetToken(string token)
{
    return _context.Users.FirstOrDefault(u => u.PasswordResetToken == token);
}


    public bool UpdateUser(User user)
    {
        _context.Users.Update(user);
        _context.SaveChanges();
        return true;
    }

    public string? GetUserRole(int roleId)
    {
        return _context.Roles.Where(r => r.Id == roleId).Select(r => r.Rolename).FirstOrDefault();
    }

    public User? GetUserByEmailAndRole(string email)
    {
        return _context.Users
               .Include(u => u.Role)
               .FirstOrDefault(u => u.Email == email);
    }

    public IQueryable<User> GetUsersQuery(string searchTerm)
    {
        var query = _context.Users.Include(u => u.Role).Where(u => !u.Isdeleted);
        if (!string.IsNullOrEmpty(searchTerm))
        {
            query = query.Where(u => u.Firstname.ToLower().Contains(searchTerm.ToLower()) || u.Lastname.ToLower().Contains(searchTerm.ToLower()));
        }
        return query;
    }

    public User? GetUserById(int id)
    {
        return _context.Users.FirstOrDefault(u => u.Id == id);
    }

    public void SoftDeleteUser(User user)
    {
        user.Isdeleted = true;
        _context.SaveChanges();
    }

    public List<Role> GetRoles()
    {
        return _context.Roles.ToList();
    }

    public Role GetRoleById(int id)
    {
        return _context.Roles.FirstOrDefault(r => r.Id == id);
    }

    public void AddUser(User user)
    {
        _context.Users.Add(user);
        _context.SaveChanges();
    }

    public User? GetUserByIdAndRole(int id)
    {
        return _context.Users.Include(u => u.Role).FirstOrDefault(u => u.Id == id);
    }

    public async Task<List<RolePermissionViewModel>> GetPermissionsByRoleAsync(string roleName)
    {
        var role = await _context.Roles.FirstOrDefaultAsync(r => r.Rolename == roleName);
        var permissions = await _context.Roleandpermissions
            .Where(rp => rp.Roleid == role.Id)
            .Select(rp => new RolePermissionViewModel
            {
                Permissionid = rp.Permissionid,
                PermissionName = rp.Permission.Permissiomname, // Ensure you have a navigation property
                Canview = rp.Canview,
                CanaddEdit = rp.CanaddEdit,
                Candelete = rp.Candelete
            })
            .ToListAsync();

        return permissions;
    }


    public async Task<bool> UpdateRolePermissionsAsync(List<RolePermissionViewModel> permissions)
    {
        foreach (var permission in permissions)
        {
            var rolePermission = await _context.Roleandpermissions
                .FirstOrDefaultAsync(rp => rp.Role.Rolename == permission.Roleid && rp.Permissionid == permission.Permissionid);

            if (rolePermission != null)
            {
                rolePermission.Canview = permission.Canview;
                rolePermission.CanaddEdit = permission.CanaddEdit;
                rolePermission.Candelete = permission.Candelete;
            }
        }

        await _context.SaveChangesAsync();
        return true;
    }


}
