using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using MiniBlog.Infrastructure.Repositories;
using MiniBlog.Core.Entities;
namespace MiniBlog.Application.Services
{
    namespace MiniBlog.Application.Services
    {
        public class commentService
        {
            private readonly commentRepository _commentRepository;

            public commentService(commentRepository commentRepository)
            {
                _commentRepository = commentRepository;
            }

            public async Task<IEnumerable<Comment>> GetAllCommentsAsync()
            {
                return await _commentRepository.GetAllCommentsAsync();
            }

            public async Task<Comment> GetCommentByIdAsync(int id)
            {
                return await _commentRepository.GetCommentByIdAsync(id);
            }

            public async Task<IEnumerable<Comment>> GetCommentsByTweetIdAsync(int tweetId)
            {
                return await _commentRepository.GetCommentsByTweetIdAsync(tweetId);
            }

            public async Task AddCommentAsync(Comment comment)
            {
                await _commentRepository.AddCommentAsync(comment);
                await _commentRepository.SaveAsync();
            }

            public async Task UpdateCommentAsync(Comment comment)
            {
                await _commentRepository.UpdateCommentAsync(comment);
                await _commentRepository.SaveAsync();
            }

            public async Task DeleteCommentAsync(int id)
            {
                await _commentRepository.DeleteCommentAsync(id);
                await _commentRepository.SaveAsync();
            }
        }
    }
}
