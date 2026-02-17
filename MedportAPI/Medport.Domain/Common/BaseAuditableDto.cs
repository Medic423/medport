namespace Medport.Domain.Common;

public class BaseAuditableDto : BaseDto
{
    public DateTime CreateDate { get; set; }
    public int CreateUserID { get; set; }
    public DateTime? UpdateDate { get; set; }
    public int? UpdateUserID { get; set; }
}
