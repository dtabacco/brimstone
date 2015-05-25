var request = require('request');
var querystring = require('querystring');

var elastic = function (api, next) {
  api.elastic = {};
  api.elastic._start  = function(api, next){
      console.log("elastic_start");

      api.elastic.url = api.config.elastic.baseUrl;
      api.elastic.path = api.config.elastic.path;

      request(api.elastic.url + api.config.elastic.statusQuery, function(err, resp, body) {
        if (err) {
          throw err;
        }

        if (body) {
          var jsObj = JSON.parse(body)
          console.log(jsObj)
          console.log(jsObj._shards.successful)
          if (jsObj._shards.successful > 0) {
            console.log('Elastic Search server is alive and well.');
           next();
          }
        }
         
      });
  };



/***************** Search for questions ****************************/
  api.elastic.questionSimilarSearch = function(api, connection, next) {

      //http://54.40.18.118:9200/templisting/listing/_search?q=description:*weight*

        console.log("Searching Elastic Search for Similar")

        //var query = "q=questionBody:" + "*" + connection.params.query + "*" + "&pretty=true";

        var query;

        if (connection.params.query === '*') {
          query = 'source={"query":{"match_all": {}}}';
        }
        else {
          //query = 'source={"query":{"bool":{"should":[{"match":{"questionTitle":"*'+ connection.params.query +'*"}},{"match":{"questionBody":"*' + connection.params.query + '*"}}]}}}';
          query = 'source={"query":{"bool":{"should":[' +
                                                      '{"match":{"questionTitle":"*'+ connection.params.query +'*"}},' +
                                                      '{"match":{"tags":"*'+ connection.params.query +'*"}},' +
                                                      '{"match":{"questionBody":"*' + connection.params.query + '*"}}' +
                                                    ']}}}';
        }
        console.log("Elastic Search Query: " + query); 
        console.log("Full REST call: " + api.elastic.url + api.elastic.path + query )

        request(api.elastic.url + api.elastic.path + query, function(err, resp, body) {
          if (err) {
            throw err;
          }
           if (body) {
            console.log(body);
            var jsObj = JSON.parse(body)
            //next(err, body);   
            next(err, jsObj);   
           }

        });
  };


/***************** Search for questions ****************************/
  api.elastic.search = function(api, connection, next) {

        //Should Make From and Size Configurable, so they can be provided via the rest call

        console.log("Searching Elastic Search")

        //var query = "q=questionBody:" + "*" + connection.params.query + "*" + "&pretty=true";

        var body;

        if (connection.params.query === '*') {
          //query = 'source={"query":{"match_all": {}}}';

          body = {
            from: 0,
            size: 20,
            query: {
              match_all: {}
            }   
          };

          //body = 'source={"from" : 0, "size" : 20,"query":{"match_all": {}}}';
        }
        else {
         
          /*query = 'source={"from" : 0, "size" : 20,"query":{"bool":{"should":[' +
                                                      '{"match":{"questionTitle":"*'+ connection.params.query +'*"}},' +
                                                      '{"match":{"tags":"*'+ connection.params.query +'*"}},' +
                                                      '{"match":{"questionBody":"*' + connection.params.query + '*"}}' +
                                                    ']}}}';*/
          body = {
            from: 0,
            size: 20,
            query: {
              bool: {
                should: [
                  {
                    fuzzy: {
                      questionTitle: connection.params.query
                    }
                  },
                  {
                    match: {
                      _all: connection.params.query,
                    }
                  },
                  {
                    match: {
                      questionTitle: connection.params.query,
                    }
                  },
                   {
                    wildcard: {
                      questionBody: connection.params.query,
                    }
                  },
                  {
                    wildcard: {
                      questionTitle: connection.params.query
                    }
                  }
                ]
              }
              
            }
          };                                         


        }

        var query = 'source=' + JSON.stringify(body)

        console.log("Elastic Search Query: " + query); 
        console.log("Full REST call: " + api.elastic.url + api.elastic.path + query )

        request(api.elastic.url + api.elastic.path + query, function(err, resp, body) {
          if (err) {
            throw err;
          }
           if (body) {
            console.log(body);
            console.log(body.length)
            var jsObj = JSON.parse(body)
            //next(err, body);   
            next(err, jsObj);   
           }

        });
  };

  /***************** Search for open questions ****************************/
  api.elastic.searchopen = function(api, connection, next) {

        console.log("Searching Elastic Search Open")

        //var query = "q=status:open" + "&pretty=true";
        //var query = 'source={"from" : 0, "size" : 20,"query":{"match":{"status":"open"}}}';

        var body = {
          from: 0,
          size: 20,
          query: {
            match: {
               status: 'open'
            }   
          }
        };

       var query = 'source=' + JSON.stringify(body)

        console.log("Elastic Search Query: " + query); 
        console.log("Full REST call: " + api.elastic.url + api.elastic.path + query )

        request(api.elastic.url + api.elastic.path + query, function(err, resp, body) {
          if (err) {
            throw err;
          }
           if (body) {
            console.log(body);
            var jsObj = JSON.parse(body)
            //next(err, body);   
            next(err, jsObj);   
           }

        });
  };

    /***************** Search for Unanswered questions ****************************/
  api.elastic.searchunanswered = function(api, connection, next) {


        console.log("Searching Elastic Search Open")

        //var query = "q=status:open" + "&pretty=true";

        var body = {
          size: 20,
          query: {
            bool: {
              must: {
                term: {
                  numAnswers: 0
                }
              }
            }   
          }
        };

       var query = 'source=' + JSON.stringify(body)

        //var query = 'source={"from" : 0, "size" : 20,"query":{"match":{"answers":"null"}}}';

        console.log("Elastic Search Query: " + query); 
        console.log("Full REST call: " + api.elastic.url + api.elastic.path + query )

        request(api.elastic.url + api.elastic.path + query, function(err, resp, body) {
          if (err) {
            throw err;
          }
           if (body) {
            console.log(body);
            var jsObj = JSON.parse(body)
            //next(err, body);   
            next(err, jsObj);   
           }

        });
  };

  /* "sort" : [
        { "myprimarykey" : "desc"} }
    ]
    */
  /***************** Search for open questions that have the most views ****************************/
  api.elastic.searchHotQuestions = function(api, connection, next) {

        console.log("Searching Elastic Search Hotest Questions")

          var body = {
          from: 0,
          size: 6,
          query: {
            match: {
               status: 'open'
            } 
          },
          sort: { views: { order: "desc" }}
        };

       var query = 'source=' + JSON.stringify(body)

        console.log("Elastic Search Query: " + query); 
        console.log("Full REST call: " + api.elastic.url + api.elastic.path + query )

        request(api.elastic.url + api.elastic.path + query, function(err, resp, body) {
          if (err) {
            throw err;
          }
           if (body) {
            console.log(body);
            var jsObj = JSON.parse(body)  
            next(err, jsObj);   
           }

        });
  };

    /***************** Search for existing tags ****************************/
  api.elastic.statsLastDay2 = function(api, connection, next) {

        console.log("Searching Elastic Search Hotest Questions")

        /*var body = {
          from: 0,
          size: 6,
          query: {
            bool : {
              must : {
                  terms : { tags : ["javascript"],
                   }
              },
            }
          }
        };*/
      var body = {
        from: 0,
        size: 6,
        query: {
          bool: {
            nested : {
              path : "answers",
              query : {
                bool : {
                  must : [
                    {
                      match: {
                        "answers.username": "tabacco"
                      }
                    }
                  ]
                }
              }
            }
          }
        }
      }

      
        /*
        var body = {
          from: 0,
          size: 6,
          query: {
          nested : {
              path : "answers",
              query : {
                bool : {
                    must : [
                        {
                            term: {
                                "answers.username": "tabacco"
                            }
                        }
                        
                    ]
                }
            }
        }
        }
      };*/



       var query = 'source=' + JSON.stringify(body)

        console.log("Elastic Search Query: " + query); 
        console.log("Full REST call: " + api.elastic.url + api.elastic.path + query )

        request(api.elastic.url + api.elastic.path + query, function(err, resp, body) {
          if (err) {
            throw err;
          }
           if (body) {
            console.log(body);
            var jsObj = JSON.parse(body)  
            next(err, jsObj);   
           }

        });
  };
  

  api.elastic._stop =  function(api, next){
    next();
  };

  next();
}

/////////////////////////////////////////////////////////////////////
// exports
exports.elastic = elastic;
