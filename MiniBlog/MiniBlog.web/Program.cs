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

            // ── Database ──────────────────────────────────────────────────────
            builder.Services.AddDbContext<ApplicationDbContext>(options =>
                options.UseSqlServer(
                    builder.Configuration.GetConnectionString("DefaultConnection")));

            // ── App Services ──────────────────────────────────────────────────
            builder.Services.AddScoped<IUserService,         UserRepository>();
            builder.Services.AddScoped<ITweetService,        TweetRepository>();
            builder.Services.AddScoped<ICommentService,      commentRepository>();
            builder.Services.AddScoped<ILikeService,         LikeRepository>();
            builder.Services.AddScoped<IMessageService,      MessageRepository>();
            builder.Services.AddScoped<INotificationService, NotificationRepository>();
            builder.Services.AddScoped<IFollowingService,    FollowingRepository>();
            builder.Services.AddScoped<IFollowerService,     FollowerRepository>();

            // ── JWT Authentication ────────────────────────────────────────────
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

                    // Let SignalR hub receive JWT from the query string
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

            // ── CORS ──────────────────────────────────────────────────────────
            builder.Services.AddCors(options =>
            {
                options.AddPolicy("Angular", policy =>
                    policy.WithOrigins("http://localhost:4200")
                          .AllowAnyHeader()
                          .AllowAnyMethod()
                          .AllowCredentials());
            });

            // ── Controllers + SignalR ─────────────────────────────────────────
            builder.Services.AddControllers();
            builder.Services.AddSignalR();

            var app = builder.Build();

            // ── Pipeline ──────────────────────────────────────────────────────
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
            app.UseStaticFiles();   // serves /Profiles/* profile pictures
            app.UseCors("Angular");
            app.UseAuthentication();
            app.UseAuthorization();

            app.MapControllers();
            app.MapHub<NotificationHub>("/notificationHub");

            app.Run();
        }
    }
}
