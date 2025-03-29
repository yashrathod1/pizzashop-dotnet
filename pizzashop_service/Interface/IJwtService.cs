namespace pizzashop_service.Interface;

public interface IJwtService
{
      string GenerateJwtToken(string email, int roleId);
}
