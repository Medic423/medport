using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Medport.Application.Tracc.Features.Hospitals.Constants;

public class HospitalConstants
{
    public static class GenericMessages
    {
        public const string SavedSuccesfully = "Hospital created successfully";
        public const string UpdatedSuccesfully = "Hospital updated successfully";
        public const string DeletedSuccesfully = "Hospital deleted successfully";
        public const string ApprovedSuccesfully = "Hospital approved successfully";
        public const string RejectedSuccesfully = "Hospital rejected successfully";

    }

    public static class Error
    {
        public const string ModelValidationAttributeInvalid = "ModelValidationAttribute.ActionFilter.Invalid";
        public const string GetHospitalByIdQueryHandlerNotFound = "GetHospitalByIdQueryHandler.Handle.NotFound";
        public const string UpdateHospitalCommandHandlerNotFound = "UpdateHospitalCommandHandler.Handle.NotFound";
    }

}
