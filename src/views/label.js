import "fabric"

fabric.LabeledRect = fabric.util.createClass(fabric.Rect, {

    type: 'labeledRect',

    toObject: function () {
        return fabric.util.object.extend(this.callSuper('toObject'), {
            label: this.get('label')
        });
    },

    _render: function (ctx) {
        this.callSuper('_render', ctx);

        ctx.font = '20px Helvetica';
        ctx.fillStyle = '#333';
        ctx.fillText(this.label, -this.width / 2, -this.height / 2 + 20);
    }
});

fabric.LabeledRect.fromObject = function (object, callback) {
    return fabric.Object._fromObject('LabeledRect', object, callback);
};