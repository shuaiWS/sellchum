/// <reference path="../../lib/drunk.d.ts" />
/// <reference path="../../lib/cookies.d.ts" />

namespace RoommateApp.QueryString {

    var query = drunk.querystring.parse(location.search.slice(1));

    export var schoolId = query['school_id'] || '';
    export var channelType = query['channel_type'] || '';

    Cookies.set('school_id', encodeURIComponent(schoolId), {
        path: '/'
    });

}