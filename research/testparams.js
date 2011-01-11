var example = {
      // a = optional;
      // b! = required;
      validators: ['a','b!'],
      paramsGood: {a:'foo',b:'bar'},
      paramsBad: {a:'foo',bad:'bar'}      
  };
  
  function mkValTest(validators) {
      var vfn = [];
      validators.forEach( function( validator ) {
          if( ( /\!$/ ).test( validator ) ){
              vfn.push(function(params) {
                  if( !(params[ validator.replace(/\!$/,'') ]) ) throw ('Missing HTTP Parameter: '+val);
              });
          };
      } );
      return function isValid(params) {
          var self = arguments.callee;
          self.errors = [];
          vfn.forEach( function( fn ){
              try{ fn( params) }catch( E ){ self.errors.push( E ) };
          } );
          return ( self.errors.length === 0 );
      };
  };
  
  function validateParams( params, rules ) {
      var valtest = mkValTest( rules  );
      return valtest(params);
  };
  
  console.debug( validateParams( example.paramsGood, example.validators ) );
  console.debug( validateParams( example.paramsBad,  example.validators ) );  
