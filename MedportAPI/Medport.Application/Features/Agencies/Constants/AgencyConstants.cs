using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace Medport.Application.Tracc.Features.Agencies.Constants;
public class AgencyConstants
{
    public static class GenericMessages
    {
        public const string Accept = "ACCEPTED";
        public const string Declined = "DECLINED";
        public const string RejectNoReasonProvided = "No reason provided";
        public const string AcceptedViaEndpoint = "Accepted via transport request endpoint";
        public const string AcceptedSuccessfully = "Transport request accepted successfully";
        public const string RejectedSuccessfully = "Transport request rejected successfully";

    }

}
