/* Copyright (c) 2014 Richard Rodger */
"use strict";

// mocha fieldmap.test.js


var assert = require('assert')


var seneca  = require('seneca')







var si = seneca()



describe('fieldmap', function() {
  
  it('basic', function(fin) {

    si.use( '..', {
      map: {
        '-/-/foo': {
          alias: {
            a:'m',
            b:'n'
          }
        }
      }
    })    

    si.ready(function(err){
      if( err ) return fin(err);

      var fooent = si.make('-/-/foo')
      fooent.make$({a:1,b:2,c:3}).save$(function(err,out){
        if( err ) return fin(err);
        //console.log('out='+out)
        assert.equal(1,out.a)
        assert.equal(2,out.b)
        assert.equal(3,out.c)

        si.act('role:mem-store,cmd:dump',function(err,dump){
          if( err ) return fin(err);

          var item = dump[void 0]['foo'][out.id]

          assert.equal('-/-/foo',item.entity$)
          assert.equal(1,item.m)
          assert.equal(2,item.n)
          assert.equal(3,item.c)
          assert.equal(null,item.a)
          assert.equal(null,item.b)


          fooent.load$(out.id,function(err,foo){
            if( err ) return fin(err);

            //console.log(foo)
            assert.equal(1,foo.a)
            assert.equal(2,foo.b)
            assert.equal(3,foo.c)


            fooent.load$({a:1},function(err,foo){
              if( err ) return fin(err);

              //console.log(foo)
              assert.equal(1,foo.a)
              assert.equal(2,foo.b)
              assert.equal(3,foo.c)


              fooent.list$({a:1},function(err,list){
                if( err ) return fin(err);

                si.act('role:mem-store,cmd:dump',function(err,dump){
                  if( err ) return fin(err);

                  var item = dump[void 0]['foo'][out.id]

                  assert.equal('-/-/foo',item.entity$)
                  assert.equal(1,item.m)
                  assert.equal(2,item.n)
                  assert.equal(3,item.c)
                  assert.equal(null,item.a)
                  assert.equal(null,item.b)


                  fooent.remove$({a:1},function(err,foo){
                    if( err ) return fin(err);

                    //console.log(foo)
                    assert.equal(1,foo.a)
                    assert.equal(2,foo.b)
                    assert.equal(3,foo.c)


                    si.act('role:mem-store,cmd:dump',function(err,dump){
                      if( err ) return fin(err);

                      assert.equal(null,dump[void 0].foo[foo.id])
                      fin()
                    })
                  })
                })
              })
            })
          })
        })
      })
    })
  })
})
