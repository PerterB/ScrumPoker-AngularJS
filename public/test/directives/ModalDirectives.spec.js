describe('Modal Directives Tests', function() {

    var bsModal;
    beforeEach(function() {
        //mock bootstrap modal
        bsModal = {
            modal: jasmine.createSpy()
        };

        //mock jQuery
        $ = jasmine.createSpy().andReturn(bsModal);
    });

    beforeEach(module('planningApp'));

    it('enterClose should close the modal when the user types enter', function() {

        inject(function($compile, $rootScope) {
            var element = $compile('<span enter-close="something" on-close="closeFn"></span>')($rootScope);


            expect(element[0].onkeyup).toBeTruthy();

            $rootScope.closeFn = jasmine.createSpy();
            $rootScope.$apply = jasmine.createSpy();

            element[0].onkeyup({keyCode: 13});


            expect($rootScope.closeFn).toHaveBeenCalled();
            expect($rootScope.$apply).toHaveBeenCalled();
            expect($).toHaveBeenCalledWith('#something');
            expect(bsModal.modal).toHaveBeenCalledWith('hide');

        });
    });


    it('enterClose should not close the modal when the user types enter', function() {

        inject(function($compile, $rootScope) {
            var element = $compile('<span enter-close="something" on-close="closeFn"></span>')($rootScope);

            expect(element[0].onkeyup).toBeTruthy();

            $rootScope.closeFn = jasmine.createSpy();
            $rootScope.$apply = jasmine.createSpy();

            element[0].onkeyup({keyCode: 10});

            expect($rootScope.closeFn).not.toHaveBeenCalled();
            expect($rootScope.$apply).not.toHaveBeenCalled();
            expect($).not.toHaveBeenCalled();
        });
    });

    //TODO: tests for clearOnShow
});