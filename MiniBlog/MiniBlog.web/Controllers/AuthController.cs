using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.AspNetCore.Mvc;
using Microsoft.IdentityModel.Tokens;
using MiniBlog.Core.Entities;
using MiniBlog.Core.Interfaces;
using MiniBlog.web.Helpers;

namespace MiniBlog.web.Controllers
{
    [ApiController]
    [Route("api/auth")]
    public class AuthController : ControllerBase
    {
        private readonly IUserService      _userService;
        private readonly IConfiguration   _config;
        private readonly IWebHostEnvironment _env;

        public AuthController(
            IUserService userService,
            IConfiguration config,
            IWebHostEnvironment env)
        {
            _userService = userService;
            _config      = config;
            _env         = env;
        }

        // POST /api/auth/signup
        [HttpPost("signup")]
        public async Task<IActionResult> Signup([FromForm] SignupRequest req,
                                                IFormFile? profilePictureFile)
        {
            if (string.IsNullOrWhiteSpace(req.Username) ||
                string.IsNullOrWhiteSpace(req.Email)    ||
                string.IsNullOrWhiteSpace(req.Password))
                return BadRequest(new { message = "Username, email and password are required." });

            var existing = await _userService.GetUserByEmailAsync(req.Email);
            if (existing != null)
                return BadRequest(new { message = "Email is already in use." });

            string picture = "default-profile.png";
            if (profilePictureFile?.Length > 0)
                picture = await SaveProfilePicture(profilePictureFile);

            var user = new User
            {
                Username       = req.Username.Trim(),
                Email          = req.Email.Trim().ToLowerInvariant(),
                Password       = PasswordHelper.HashPassword(req.Password),
                ProfilePicture = picture
            };

            await _userService.AddUserAsync(user);

            return Ok(new { message = "Account created successfully." });
        }

        // POST /api/auth/login
        [HttpPost("login")]
        public async Task<IActionResult> Login([FromBody] LoginRequest req)
        {
            if (string.IsNullOrWhiteSpace(req?.Email) || string.IsNullOrWhiteSpace(req?.Password))
                return BadRequest(new { message = "Email and password are required." });

            var user = await _userService.GetUserByEmailAsync(req.Email.Trim().ToLowerInvariant());
            if (user == null || !PasswordHelper.VerifyPassword(req.Password, user.Password))
                return Unauthorized(new { message = "Invalid email or password." });

            var token = GenerateJwtToken(user);

            return Ok(new
            {
                token,
                user = MapUser(user)
            });
        }

        // POST /api/auth/logout
        [HttpPost("logout")]
        public IActionResult Logout() => Ok(new { message = "Logged out." });

        // ── Helpers ───────────────────────────────────────────────────────────

        private string GenerateJwtToken(User user)
        {
            var key   = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_config["Jwt:Key"]!));
            var creds = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

            var claims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, user.Id.ToString()),
                new Claim(ClaimTypes.Name,           user.Username)
            };

            var token = new JwtSecurityToken(
                issuer:            _config["Jwt:Issuer"],
                audience:          _config["Jwt:Audience"],
                claims:            claims,
                expires:           DateTime.UtcNow.AddDays(
                                       int.TryParse(_config["Jwt:ExpiryDays"], out var d) ? d : 7),
                signingCredentials: creds);

            return new JwtSecurityTokenHandler().WriteToken(token);
        }

        private async Task<string> SaveProfilePicture(IFormFile file)
        {
            var folder = Path.Combine(_env.WebRootPath ?? "wwwroot", "Profiles");
            Directory.CreateDirectory(folder);
            var fileName = $"{Guid.NewGuid()}_{Path.GetFileName(file.FileName)}";
            var path     = Path.Combine(folder, fileName);
            await using var fs = new FileStream(path, FileMode.Create);
            await file.CopyToAsync(fs);
            return fileName;
        }

        private static object MapUser(User u) => new
        {
            id             = u.Id,
            username       = u.Username,
            email          = u.Email,
            profilePicture = u.ProfilePicture,
            followersCount = u.FollowersCount,
            followingCount = u.FollowingCount
        };

        // ── Request DTOs ─────────────────────────────────────────────────────

        public class SignupRequest
        {
            public string Username { get; set; } = "";
            public string Email    { get; set; } = "";
            public string Password { get; set; } = "";
        }

        public class LoginRequest
        {
            public string Email    { get; set; } = "";
            public string Password { get; set; } = "";
        }
    }
}
