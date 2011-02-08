	var LL;
function initialize(position) {
    LL = [position.coords.latitude, position.coords.longitude].join(',');
    // Supply your foursquare client id
    var FSQUARE_CLIENT_ID = 'CQNYUACMANEXA124BE5ANZ3FJMDZX2ITACMODYWAWFD10FIM';
    // setup with your key and a callback function which
    // receives the Marelle Object ( "M" in this example )
    $.marelle(FSQUARE_CLIENT_ID,
    function(evt, M) {
        // You can bind listeners for connection/disconnection
        M.bind('connected',
        function(evt, user) {
            kill.call(evt)
            // Generates a sign-out button and appends to the body
            M.signoutButton('#mast');
            $('#wrap').show();
            $('#add-schedule').button({
                icons: {
                    primary: 'ui-icon-plusthick'
                }
            });
            $('#add-schedule').bind('click',
            function(event) {
                kill.call(event);
                makeFields()
            });
            dopoll()
        }).bind('disconnected',
        function() {
            // Generates a sign-in button and appends to the body
            M.signinButton('#mast');
        });
    });
    $("#placepicks").dialog({
        height: 300,
        width: 350,
        modal: true,
        autoOpen: false,
        buttons: {
            Cancel: function() {
                $(this).dialog("close");
            }
        },
        close: function() {
            $('#placepicks .venues').empty();
        }
    });
}

$.fn.placePicker = function() {

    var btn = $(this);
    var rep = $('<input>').attr({
        type: 'text',
        name: 'venue'
    });
    var repid = $('<input class="repid" type="hidden">').attr({
        name: 'venue'
    });
    btn.bind('click',
    function(event) {
        kill.call(event);
        $.marelle.Venue.search({
            ll: LL
        },
        function(response) {
            var group = response.groups[1] || response.groups[0];
            group.items.forEach(function(venue) {
                var anch = $('<a>').text(venue.name).button()
                anch.bind('click',
                function(event) {
                    kill.call(event);
                    rep.val(venue.name);
                    repid.val(venue.id);
                    btn.replaceWith(rep.attr('disabled','disabled'));
                    rep.after(repid);
                    $('#placepicks').dialog('close');
                    
                    // $('fieldset').each(function() {
                    //                            var set = $(this);
                    //                            var vid = set.find('.repid').val();
                    //                            if (vid) {
                    //                                var now = (new Date()).getTime();
                    //                                var exp = parseFloat(set.data('ref')) + (set.find('.minutes').val() * 1000);
                    //                                if (exp >= now) {
                    //                                    console.debug(exp >= now)
                    //                                    // $.marelle.Checkin.add({venueId:vid,broadcast:'private'},function() {
                    //                                    //                                set.find('input').attr('disabled','disabled');
                    //                                    //                                set.fadeOut(3000,function() {
                    //                                    //                                    set.remove();
                    //                                    //                                })
                    //                                    //                            })
                    //                                }
                    // 
                    //                            }
                    //                        })
                    //                     
                    
                });
                var li = $('<li>');
                $('#placepicks .venues').append(li.append(anch));
            });
            $('#placepicks').dialog('open');
        })
    })
    // $('#placepicks')
    return this;
};
function kill() {
    this.preventDefault();
};
function makeFields() {
    var form = $('form:first');
    var fields = $('<fieldset>');
    var time = $('<input type="number" class="minutes" name="minutes" value="1" min="1" max="10">');
    var placepicker = $('<button>select a venue...</button>').button().placePicker();

    fields.append(document.createTextNode('Minutes from now:'), time, placepicker)
    form.append(fields);
    fields.data('ref', (new Date()).getTime());
};
// on DOM ready...
$(function() {
    navigator.geolocation.getCurrentPosition(initialize);
});
