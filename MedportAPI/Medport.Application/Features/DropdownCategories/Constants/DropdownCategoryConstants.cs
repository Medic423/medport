using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Medport.Application.Tracc.Features.DropdownCategories.Constants;

public class DropdownCategoryConstants
{
    public static class GenericMessages
    {
        public const string SavedSuccesfully = "Dropdown Category created successfully";
        public const string UpdatedSuccesfully = "Dropdown Category updated successfully";
        public const string DeletedSuccesfully = "Dropdown Category deleted successfully";
        public const string CategoriesRetrievedSuccesfully = "Categories retrieved successfully";
    }

    public static class Error
    {
        public const string DeleteDropdownCategoryCommandHandlerNotFound = "DropdownCategory.Delete.NotFound";
        public const string UpdateHospitalCommandHandlerNotFound = "UpdateHospitalCommandHandler.Handle.NotFound";
        public const string DeleteHospitalCommandHandlerNotFound = "DeleteHospitalCommandHandler.Handle.NotFound";
    }
}
