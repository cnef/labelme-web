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

        ctx.font = '14px Helvetica';
        ctx.fillStyle = '#409EFF';
        ctx.fillText(this.label, -this.width / 2 + 5, -this.height / 2 + 15);
    }
});

fabric.LabeledRect.fromObject = function (object, callback) {
    return fabric.Object._fromObject('LabeledRect', object, callback);
};