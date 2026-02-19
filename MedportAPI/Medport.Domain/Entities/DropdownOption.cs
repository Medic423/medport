using System;

namespace Medport.Domain.Entities
{
    public class DropdownOption
    {
        public Guid Id { get; set; } = Guid.NewGuid();

        public string Category { get; set; } // dropdown-1, dropdown-2, etc.

        public Guid? CategoryId { get; set; }

        public string Value { get; set; }

        public bool IsActive { get; set; } = true;

        public int DisplayOrder { get; set; }

        public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

        public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

        // Navigation properties
        public virtual DropdownCategory DropdownCategory { get; set; }
    }
}