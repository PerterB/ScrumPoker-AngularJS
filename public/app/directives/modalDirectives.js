/**
 * Directive for a text input in a dialog.
 * On Enter close the modal window that has the id provided.
 */
PlanningApp.app.directive('enterClose', function() {
	return {
		link: function(scope, element, attrs) {
			
			element[0].onkeyup = function(evt) {
				if (evt.keyCode === 13) {

                    // call the on-close method if it exists
                    if (attrs.onClose && scope[attrs.onClose]) {
                        scope[attrs.onClose]();
                    }

                    // forces ui update
                    scope.$apply();

					$('#' + attrs.enterClose).modal('hide');	
				}
			};
			
		}
	};
});

/**
 * Directive to clear a text input in the window on show
 */
PlanningApp.app.directive('clearOnShow', function() {
    return {
        link: function(scope, element, attrs) {

            element.on('show.bs.modal', function() {
                $('#' + attrs.clearOnShow).val('');
            });

        }
    };
});