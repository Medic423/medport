namespace Medport.Application.Tracc.Features.Facilities.Constants;

public static class FacilityConstants
{
    public static class Messages
    {
        public const string Created = "Facility created successfully";
        public const string Updated = "Facility updated successfully";
        public const string Deleted = "Facility deleted successfully";
    }

    public static class Error
    {
        public const string GetFacilityByIdQueryHandlerNotFound = "GetFacilityByIdQueryHandler.Handle.NotFound";
        public const string UpdateFacilityCommandHandlerNotFound = "UpdateFacilityCommandHandler.Handle.NotFound";
        public const string DeleteFacilityCommandHandlerNotFound = "DeleteFacilityCommandHandler.Handle.NotFound";
    }
}
