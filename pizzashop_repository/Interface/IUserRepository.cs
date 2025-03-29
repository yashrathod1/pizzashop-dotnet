using pizzashop_repository.Models;
using pizzashop_repository.ViewModels;

namespace pizzashop_repository.Interface;

public interface IUserRepository
{
    User? GetUserByEmail(string email);

    User? GetUserByUsername(string username);

    User GetUserByResetToken(string token);

    bool UpdateUser(User user);

    string? GetUserRole(int roleId);


    User? GetUserByEmailAndRole(string email);
    
    IQueryable<User> GetUsersQuery(string searchTerm);

    User GetUserById(int id);

    void SoftDeleteUser(User user);

    List<Role> GetRoles();
    Role GetRoleById(int id);

    void AddUser(User user);

    User? GetUserByIdAndRole(int id);

    Task<List<RolePermissionViewModel>> GetPermissionsByRoleAsync(string roleName);

    Task<bool> UpdateRolePermissionsAsync(List<RolePermissionViewModel> permissions);

    

}

    
