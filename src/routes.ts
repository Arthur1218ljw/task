import Router from 'koa-router'

const router = new Router()
router.get('/index',async ctx=>{
    await ctx.render('index', {
        title: 'Welcome to Koa',
        message: 'Hello, world!'
      });
})
export default router