const productEventHandler = require('../api/handler/event_handler');

const init = () => {
    initEventListener();
};
const initEventListener = () => {
    productEventHandler.addOrder();
    productEventHandler.revertStock();
};

module.exports = {
    init: init
};
