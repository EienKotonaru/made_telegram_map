from aiohttp import web
from config.config import CONFIG

from app.views import basic, model_views


APPLICATION = web.Application()
APPLICATION['conf'] = CONFIG


APPLICATION.add_routes([
    web.get(f'{CONFIG["api_prefix"]}/test', basic.test_connection),
    web.post(f'{CONFIG["api_prefix"]}/get_subgraph', model_views.predict_opt_movements),
])
