using System;
using System.Collections.Generic;

namespace Medport.Domain.Entities
{
    public class CenterUser
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string Email { get; set; }

        public string Password { get; set; }

        public string Name { get; set; }

        public string UserType { get; set; } // ADMIN or USER

        public bool IsActive { get; set; } = true;

        public DateTime? LastLogin { get; set; }

        public DateTime? LastActivity { get; set; }

        public DateTime? DeletedAt { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool MustChangePassword { get; set; }
    }
}