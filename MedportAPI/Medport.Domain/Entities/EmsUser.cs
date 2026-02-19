using System;
using System.Collections.Generic;

namespace Medport.Domain.Entities
{
    public class EmsUser
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string Email { get; set; }

        public string Password { get; set; }

        public string Name { get; set; }

        public string AgencyName { get; set; }

        public Guid AgencyId { get; set; }

        public string UserType { get; set; } = "EMS";

        public bool IsActive { get; set; } = true;

        public bool IsSubUser { get; set; }

        public Guid? ParentUserId { get; set; }

        public bool OrgAdmin { get; set; }

        public DateTime? LastLogin { get; set; }

        public DateTime? LastActivity { get; set; }

        public DateTime? DeletedAt { get; set; }

        public bool IsDeleted { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        public bool MustChangePassword { get; set; }

        // Navigation properties
        public virtual EmsAgency Agency { get; set; }

        public virtual ICollection<AgencyResponse> AgencyResponses { get; set; } = new List<AgencyResponse>();
    }
}