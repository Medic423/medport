using System;
using System.Collections.Generic;

namespace Medport.Domain.Entities
{
    public class DropdownCategory
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string Slug { get; set; } // dropdown-1, dropdown-2, etc.

        public string DisplayName { get; set; }

        public int DisplayOrder { get; set; }

        public bool IsActive { get; set; } = true;

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual ICollection<DropdownOption> Options { get; set; } = new List<DropdownOption>();
    }
}