import type tr from './tr';

const tutorials: typeof tr = {
    nav: '使用说明',
    eyebrow: '教程视频',
    title: '如何使用？',
    subtitle: '通过简短的解说视频，观看从注册到设计审批的每一个步骤。',
    help: '使用说明',
    helpHint: '涵盖设计器全部功能的简短教程视频',
    playerTitle: '教程视频',
    videoLangNote: '',
    watch: '观看',
    close: '关闭 (Esc)',
    groupStart: '入门',
    groupEditor: '设计器',
    items: {
        signup: { title: '注册与登录', desc: '几步即可创建账户，并再次登录。' },
        template: { title: '修改现成模板', desc: '选择一个现成设计，然后更改文字、颜色和徽标。' },
        scratch: { title: '从零开始设计与设计器导览', desc: '选择单据类型、起始模板和您的数据。' },
        textImage: { title: '添加文字、图片和方框', desc: '为单据添加文字、徽标、印章、签名和方框。' },
        tableFormula: { title: '添加表格和公式', desc: '创建自己的表格，并用金额进行计算。' },
        qrChart: { title: '二维码、图表和占比条', desc: '为单据添加二维码、图表和明细行占比指示条。' },
        columnBackground: { title: '添加列和背景', desc: '添加或隐藏明细表的列；为页面设置背景。' },
        documentFields: { title: '添加单据字段', desc: '将任意发票数据（如合同或项目参考号）添加到设计中。' },
        editFields: { title: '编辑现有字段', desc: '字体、颜色、边框、位置；隐藏与撤销。' },
        saveApprove: { title: '保存、测试下载与审批', desc: '保存设计，免费试用，然后审批并下载。' },
    },
};

export default tutorials;
