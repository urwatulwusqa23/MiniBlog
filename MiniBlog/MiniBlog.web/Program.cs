using System.Text;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using MiniBlog.Core.Interfaces;
using MiniBlog.Infrastructure.Persistance;
using MiniBlog.Infrastructure.Repositories;
using MiniBlog.web.Hubs;

namespace MiniBlog.web
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            // Database — auto-selects provider from connection string
            // Local dev:  "Data Source=(localdb)..." -> SQL Server
            // Production: "Host=..."                  -> PostgreSQL (Neon/Render)
            var connStr  = builder.Configuration.GetConnectionString("DefaultConnection")!;
            var isPostgres = connStr.Contains("Host=") ||
                             connStr.StartsWith("postgresql", StringComparison.OrdinalIgnoreCase) ||
                             connStr.StartsWith("postgres", StringComparison.OrdinalIgnoreCase);

            builder.Services.AddDbContext<ApplicationDbContext>(options =>
            {
                if (isPostgres)
                    options.UseNpgsql(connStr);
                else
                    options.UseSqlServer(connStr);
            });

            // App services
            builder.Services.AddScoped<IUserService,         UserRepository>();
            builder.Services.AddScoped<ITweetService,        TweetRepository>();
            builder.Services.AddScoped<ICommentService,      commentRepository>();
            builder.Services.AddScoped<ILikeService,         LikeRepository>();
            builder.Services.AddScoped<IMessageService,      MessageRepository>();
            builder.Services.AddScoped<INotificationService, NotificationRepository>();
            builder.Services.AddScoped<IFollowingService,    FollowingRepository>();
            builder.Services.AddScoped<IFollowerService,     FollowerRepository>();

            // JWT Authentication
            var jwtKey = builder.Configuration["Jwt:Key"]!;
            builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
                .AddJwtBearer(options =>
                {
                    options.TokenValidationParameters = new TokenValidationParameters
                    {
                        ValidateIssuer           = true,
                        ValidateAudience         = true,
                        ValidateLifetime         = true,
                        ValidateIssuerSigningKey = true,
                        ValidIssuer              = builder.Configuration["Jwt:Issuer"],
                        ValidAudience            = builder.Configuration["Jwt:Audience"],
                        IssuerSigningKey         = new SymmetricSecurityKey(
                                                       Encoding.UTF8.GetBytes(jwtKey))
                    };

                    // SignalR passes JWT in query string
                    options.Events = new JwtBearerEvents
                    {
                        OnMessageReceived = ctx =>
                        {
                            var token = ctx.Request.Query["access_token"];
                            if (!string.IsNullOrEmpty(token) &&
                                ctx.HttpContext.Request.Path.StartsWithSegments("/notificationHub"))
                            {
                                ctx.Token = token;
                            }
                            return Task.CompletedTask;
                        }
                    };
                });

            builder.Services.AddAuthorization();

            // CORS — origins configured via appsettings / environment variables
            var allowedOrigins = builder.Configuration
                .GetSection("Cors:AllowedOrigins")
                .Get<string[]>() ?? new[] { "http://localhost:4200" };

            builder.Services.AddCors(options =>
            {
                options.AddPolicy("Angular", policy =>
                    policy.WithOrigins(allowedOrigins)
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials());
            });

            builder.Services.AddControllers();
            builder.Services.AddSignalR();

            var app = builder.Build();

            // Apply DB schema on startup
            using (var scope = app.Services.CreateScope())
            {
                var db = scope.ServiceProvider.GetRequiredService<ApplicationDbContext>();
                if (isPostgres)
                    db.Database.EnsureCreated();   // provider-agnostic schema creation
                else
                    db.Database.Migrate();          // SQL Server migrations
            }

            if (!app.Environment.IsDevelopment())
            {
                app.UseExceptionHandler(errApp => errApp.Run(async ctx =>
                {
                    ctx.Response.StatusCode  = 500;
                    ctx.Response.ContentType = "application/json";
                    await ctx.Response.WriteAsync("{\"error\":\"Internal server error\"}");
                }));
                app.UseHsts();
            }

            app.UseHttpsRedirection();
            app.UseStaticFiles();
            app.UseCors("Angular");
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();
            app.MapHub<NotificationHub>("/notificationHub");
            app.MapFallbackToFile("index.html");   // Angular SPA fallback

            app.Run();
        }
    }
}
