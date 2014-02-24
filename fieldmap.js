/* Copyright (c) 2014 Richard Rodger, MIT License */
"use strict";



var _ = require('underscore')


module.exports = function( options ) {
  var seneca = this
  var plugin = 'fieldmap'



  options = seneca.util.deepextend({
  },options)
  


  function inward_alias(fields,aliasmap) {
    if( null == fields ) return;

    _.each(aliasmap, function(internal,external){
      if( !_.isUndefined( fields[external] ) ) {
        fields[internal] = fields[external]
        delete fields[external]
      }
    })
  }


  function outward_alias(fields,aliasmap) {
    if( null == fields ) return;

    _.each(aliasmap, function(internal,external){
      if( !_.isUndefined( fields[internal] ) ) {
        fields[external] = fields[internal]
        delete fields[internal]
      }
    })
  }



  var aliasmap = {
    save: function( aliasmap ) {
      return function( args, done ) {
        inward_alias(args.ent,aliasmap)
        this.prior(args,function(err,out){
          if(err) return done(err);
          outward_alias(out,aliasmap)
          done(null,out)
        })
      }
    },
    load: function( aliasmap ) {
      return function( args, done ) {
        inward_alias(args.q,aliasmap)
        this.prior(args,function(err,out){
          if(err) return done(err);
          outward_alias(out,aliasmap)
          done(null,out)
        })
      }
    },
    list: function( aliasmap ) {
      return function( args, done ) {
        inward_alias(args.q,aliasmap)
        this.prior(args,function(err,list){
          if(err) return done(err);
          _.each(list,function(item){outward_alias(item,aliasmap)})
          done(null,list)
        })
      }
    },
    remove: function( aliasmap ) {
      return function( args, done ) {
        inward_alias(args.q,aliasmap)
        this.prior(args,function(err,out){
          if(err) return done(err);
          outward_alias(out,aliasmap)
          done(null,out)
        })
      }
    }
  }

  function mapper( spec ) {
    return function(args,done) {
      var seneca = this
      var aliasfunc = aliasmap[args.cmd](spec.alias||{})
      if( aliasfunc ) return aliasfunc.call(seneca,args,done)

      return seneca.prior(args,done)
    }
  }


  // define sys/fieldmap entity
  seneca.add({init:plugin}, function( args, done ){
    var map = options.map || {}

    _.each( map, function(v,k){
      var canon = seneca.util.parsecanon(k)

      var entargs = _.extend({role:'entity'},canon)

      var cmds = seneca.store.cmds || ['save','load','list','remove','close','native']

      _.each( cmds, function( cmd ){
        var cmdargs = _.extend({cmd:cmd},entargs)
        seneca.add( cmdargs, mapper(v) )
      })
    })

    done()
  })


  return {
    name: plugin
  }
}
