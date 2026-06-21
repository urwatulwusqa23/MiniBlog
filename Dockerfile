# ── Stage 1: Build Angular ────────────────────────────────────────────────────
FROM node:18-alpine AS angular-build
WORKDIR /app
COPY package*.json ./
RUN npm ci
COPY src/ ./src/
COPY angular.json tsconfig*.json ./
RUN npm run build -- --configuration production

# ── Stage 2: Build .NET ───────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/sdk:8.0 AS dotnet-build
WORKDIR /src
COPY MiniBlog/ ./
RUN dotnet publish MiniBlog.web/MiniBlog.web.csproj \
    --configuration Release \
    --output /publish

# ── Stage 3: Runtime ──────────────────────────────────────────────────────────
FROM mcr.microsoft.com/dotnet/aspnet:8.0 AS runtime
WORKDIR /app

COPY --from=dotnet-build /publish ./
COPY --from=angular-build /app/dist/miniblog-angular/. ./wwwroot/

# Render sets PORT; ASP.NET Core reads ASPNETCORE_URLS
ENV ASPNETCORE_URLS=http://+:${PORT:-8080}
EXPOSE 8080

ENTRYPOINT ["dotnet", "MiniBlog.web.dll"]
