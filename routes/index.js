const adminRoutes = require('./adminRoutes');
const geminiChatbotRouter = require('./geminichatbotRoute');
const branchRouter = require('./branchRoutes');
const industryRouter = require('./industryRoutes')
const serviceRouter = require('./serviceRoutes')
const subServiceEouter = require('./subServiceRoutes')
const serviceFaqRouter = require('./ServiceFaqRouter')
const technologyRouter = require('./technologyRoutes')
const socialMediaRouter = require('./socialMediaRoutes')
const bannerRouter = require('./bannerRoutes')
const blogRouter = require('./blogRouters')
const ourClientRouter = require('./ourClientsRoutes')
const certificateRouter = require('./certificateRoutes')
const feedbackRouter = require('./feedbackRoutes')
const caseStudytRouter = require('./caseStudyRoutes')
const imageRouter = require('./ImageRoute')
const headerRouter = require('./headerRouter')
const serviceDetailRouter = require('./servicDetailsRoute')
const fieldRouter = require('./fieldRoutes')
const industryPage = require('./industryPageRoutes')
const steps = require('./setpsRoute')

module.exports = (app) => {
    app.use('/api/v1/header', headerRouter)
    app.use('/api/v1/banner', bannerRouter)
    app.use('/api/v1/blog', blogRouter)
    app.use('/api/v1/branch', branchRouter);
    app.use('/api/v1/caseStudy', caseStudytRouter)
    app.use('/api/v1/certificate', certificateRouter)
    app.use('/api/v1/feedback', feedbackRouter)
    app.use('/api/v1/industry', industryRouter);
    app.use('/api/v1/industryPage', industryPage)
    app.use('/api/v1/ourClient', ourClientRouter)
    app.use('/api/v1/service', serviceRouter)
    app.use('/api/v1/subService', subServiceEouter)
    app.use('/api/v1/serviceFaq', serviceFaqRouter)
    app.use('/api/v1/serviceDetail', serviceDetailRouter)
    app.use('/api/v1/socialMedia', socialMediaRouter)
    app.use('/api/v1/technology', technologyRouter)
    app.use('/api/v1/field', fieldRouter)
    app.use('/api/v1/admin', adminRoutes);
    app.use('/api/v1/image', imageRouter);
    app.use('/api/v1/steps', steps);
    app.use('/api/v1/geminichatbot', geminiChatbotRouter);
};  