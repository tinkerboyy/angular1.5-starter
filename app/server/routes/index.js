module.exports = function(app) {
    var api = '/api';
    var data = '/../../data/';
    var jsonfileservice = require('./utils/jsonfileservice')();

  //  app.get(api + '/accounts/:id', getAccount);
    app.get(api + '/accounts', getAllAccounts);
    app.get(api + '/rates', getRates);


    function getCustomer(req, res, next) {
        var json = jsonfileservice.getJsonFromFile(data + 'accounts.json');
        var account = json.filter(function(c) {
            return c.id === parseInt(req.params.id);
        });
        res.send(account[0]);
    }

    function getAllAccounts(req, res, next) {
        var json = jsonfileservice.getJsonFromFile(data + 'accounts.json');
        res.send(json);
    }

    function getRates(req, res, next) {
        var json = jsonfileservice.getJsonFromFile(data + 'rates.json');
        res.send(json);
    }
};
