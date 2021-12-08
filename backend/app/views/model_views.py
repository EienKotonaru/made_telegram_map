from aiohttp import web
from PIL import Image
import io
import base64
import pandas as pd
import numpy as np
from io import StringIO
import matplotlib.pyplot as plt
import seaborn as sns
import json
import networkx as nx

import plotly
import plotly.graph_objs as go
import plotly.express as px
from plotly.subplots import make_subplots

from scipy import interpolate
from scipy import ndimage
# import csv

def get_hops_subgraph(node_name, hops=2, limit=200):
    edges_cleared = pd.read_csv('app/data/edges.csv')
    nodes = pd.read_csv('app/data/nodes.csv')

    fullG = nx.Graph()
    fullG.add_nodes_from(nodes["link"].to_numpy())
    fullG.add_edges_from(edges_cleared[["from_channel_link", "to_channel_link"]].to_numpy())

    if node_name not in fullG.nodes():
        return None
    neighbors = [node_name]
    for_next = [node_name]

    for _ in range(hops):
        to_check = for_next
        for_next = []
        for node in to_check:
            neighbors += list(fullG.neighbors(node))
            for_next += list(fullG.neighbors(node))
            if len(neighbors) > limit:
                break
    G = fullG.subgraph(neighbors)
    layout = nx.kamada_kawai_layout(G)

    edge_x = []
    edge_y = []

    for edge in G.edges():
        x0, y0 = layout[edge[0]]
        x1, y1 = layout[edge[1]]
        edge_x.append(x0)
        edge_x.append(x1)
        edge_x.append(None)
        edge_y.append(y0)
        edge_y.append(y1)
        edge_y.append(None)

    edge_trace = go.Scatter(
        x = edge_x, y = edge_y,
        line = dict(width = 0.5, color = '#888'),
        hoverinfo = 'none',
        mode = 'lines')

    node_x = []
    node_y = []
    node_text = []

    for node in G.nodes():
        x, y = layout[node]
        if len(nodes[nodes['link'] == node]['title']):
            title = nodes[nodes['link'] == node]['title'].values[0]
        else:
            title = ""
        node_text.append("@" + node + "<br>" + title)
        node_x.append(x)
        node_y.append(y)

    node_trace = go.Scatter(
        x=node_x, y=node_y,
        mode='markers',
        hoverinfo='text',
        marker=dict(
            showscale=True,
            colorscale='YlGnBu',
            reversescale=True,
            color=[],
            size=10,
            colorbar=dict(
                thickness=15,
                title='Node Connections',
                xanchor='left',
                titleside='right'
            ),
            line_width=2))

    node_adjacencies = []
    for node, adjacencies in enumerate(G.adjacency()):
        node_adjacencies.append(len(adjacencies[1]))

    start_id = list(G.nodes).index(node_name)
    node_adjacencies[start_id] = 999

    node_trace.marker.color = node_adjacencies
    node_trace.text = node_text

    fig = go.Figure(data=[edge_trace, node_trace],
                    layout=go.Layout(
                        title='<br>Network graph for channel ' + node_name,
                        titlefont_size=14,
                        showlegend=False,
                        hovermode='closest',
                        margin=dict(b=20,l=5,r=5,t=40),
                        xaxis=dict(showgrid=False, zeroline=False, showticklabels=False),
                        yaxis=dict(showgrid=False, zeroline=False, showticklabels=False))
                    )

    return json.loads(json.dumps(fig, cls=plotly.utils.PlotlyJSONEncoder))


async def predict_opt_movements(request):
    data = await request.json()
    channel = data.get('channel', "r")

    res = get_hops_subgraph(node_name=channel)

    if res is None:
        return web.json_response(
            {
                "channel_in_base": False,
                "plotly_graph": False
            })
    else:
        return web.json_response(
            {
                "channel_in_base": True,
                "plotly_graph": res
            })
