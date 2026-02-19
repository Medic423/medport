using System.ComponentModel.DataAnnotations.Schema;

namespace Medport.Domain.Common;

public class BaseAuditableDto : BaseDto
{
    [Column("createdAt")]
    public DateTime CreatedAt { get; set; }

    [Column("updatedAt")]
    public DateTime? UpdatedAt { get; set; }
}
