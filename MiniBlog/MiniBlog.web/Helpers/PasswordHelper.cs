using System.Security.Cryptography;

namespace MiniBlog.web.Helpers
{
    public static class PasswordHelper
    {
        public static string HashPassword(string password)
        {
            byte[] salt = new byte[16];
            RandomNumberGenerator.Fill(salt);

            using var pbkdf2 = new Rfc2898DeriveBytes(
                password, salt, 100_000, HashAlgorithmName.SHA256);
            byte[] hash = pbkdf2.GetBytes(32);

            byte[] combined = new byte[48];
            Buffer.BlockCopy(salt, 0, combined, 0,  16);
            Buffer.BlockCopy(hash, 0, combined, 16, 32);
            return Convert.ToBase64String(combined);
        }

        public static bool VerifyPassword(string password, string stored)
        {
            try
            {
                byte[] combined = Convert.FromBase64String(stored);
                if (combined.Length == 48)
                {
                    byte[] salt       = combined[..16];
                    byte[] storedHash = combined[16..];
                    using var pbkdf2  = new Rfc2898DeriveBytes(
                        password, salt, 100_000, HashAlgorithmName.SHA256);
                    byte[] hash = pbkdf2.GetBytes(32);
                    return CryptographicOperations.FixedTimeEquals(hash, storedHash);
                }
            }
            catch { }
            // Fallback: plaintext comparison for accounts created before hashing was added
            return stored == password;
        }
    }
}
