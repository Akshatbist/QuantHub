import React, { useState } from "react";
import Header from "../components/Header";

interface DocSection {
  id: string;
  title: string;
  content: React.ReactNode;
}

const DocsPage = () => {
  const [activeSection, setActiveSection] = useState("getting-started");

  const docSections: DocSection[] = [
    {
      id: "getting-started",
      title: "Getting Started",
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white mb-6">
            Getting Started with Quant Hub
          </h2>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              Quick Start Guide
            </h3>
            <div className="space-y-4 text-gray-300">
              <p>
                Welcome to Quant Hub! This guide will help you get started with
                our platform for quantitative trading strategy development and
                backtesting.
              </p>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  1. Create an Account
                </h4>
                <p>
                  Sign up for a free account to access all features including
                  strategy uploads, backtesting, and community features.
                </p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  2. Upload Your First Strategy
                </h4>
                <p>
                  Navigate to the Strategies page and upload your first trading
                  strategy. We support Python (.py) and Jupyter Notebook
                  (.ipynb) files.
                </p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  3. Run Your First Backtest
                </h4>
                <p>
                  Use our backtesting engine to test your strategy against
                  historical data and analyze performance metrics.
                </p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  4. Join the Community
                </h4>
                <p>
                  Connect with other quant traders, ask questions, and share
                  insights in our community forum.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "strategy-upload",
      title: "Strategy Upload",
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white mb-6">
            Uploading Trading Strategies
          </h2>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              Supported Formats
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  Python Files (.py)
                </h4>
                <p className="text-gray-300">
                  Standard Python scripts with your trading logic
                </p>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  Jupyter Notebooks (.ipynb)
                </h4>
                <p className="text-gray-300">
                  Interactive notebooks with code and documentation
                </p>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-white mb-4">
              Strategy Requirements
            </h3>
            <div className="space-y-4 text-gray-300">
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  Required Functions
                </h4>
                <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                  {`def initialize(context):
    # Set up your strategy parameters
    pass

def handle_data(context, data):
    # Your main trading logic
    pass`}
                </pre>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  Strategy Metadata
                </h4>
                <p>Include the following information in your strategy:</p>
                <ul className="list-disc list-inside mt-2 space-y-1">
                  <li>Strategy name and description</li>
                  <li>Risk level (Low, Medium, High)</li>
                  <li>Asset classes (Stocks, Options, Futures, etc.)</li>
                  <li>Time frame (Intraday, Daily, Weekly)</li>
                  <li>Tags for categorization</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "backtesting",
      title: "Backtesting",
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white mb-6">
            Backtesting Your Strategies
          </h2>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              Backtesting Engine
            </h3>
            <div className="space-y-4 text-gray-300">
              <p>
                Our backtesting engine uses QuantConnect's LEAN framework to
                provide accurate historical simulation of your trading
                strategies.
              </p>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  Available Data
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>US Equities (2000+ stocks)</li>
                  <li>Options and Futures</li>
                  <li>Forex and Crypto</li>
                  <li>Alternative data sources</li>
                </ul>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  Performance Metrics
                </h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  <div>
                    <h5 className="font-semibold text-blue-400">
                      Sharpe Ratio
                    </h5>
                    <p className="text-sm">Risk-adjusted returns</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-green-400">
                      Max Drawdown
                    </h5>
                    <p className="text-sm">Largest peak-to-trough decline</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-purple-400">Win Rate</h5>
                    <p className="text-sm">Percentage of profitable trades</p>
                  </div>
                  <div>
                    <h5 className="font-semibold text-yellow-400">
                      Profit Factor
                    </h5>
                    <p className="text-sm">Gross profit / Gross loss</p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              Running a Backtest
            </h3>
            <div className="space-y-4 text-gray-300">
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  Step 1: Select Strategy
                </h4>
                <p>
                  Choose from your uploaded strategies or browse the community
                  library.
                </p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  Step 2: Configure Parameters
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Set start and end dates</li>
                  <li>Choose initial capital</li>
                  <li>Select data resolution</li>
                  <li>Configure transaction costs</li>
                </ul>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  Step 3: Run and Analyze
                </h4>
                <p>
                  Execute the backtest and review detailed performance reports,
                  equity curves, and trade analysis.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "api-reference",
      title: "API Reference",
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white mb-6">API Reference</h2>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              Authentication
            </h3>
            <div className="space-y-4 text-gray-300">
              <p>All API requests require authentication using your API key.</p>
              <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                {`Authorization: Bearer YOUR_API_KEY`}
              </pre>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">Endpoints</h3>
            <div className="space-y-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  Upload Strategy
                </h4>
                <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                  {`POST /api/strategies/upload
Content-Type: multipart/form-data

{
  "name": "My Strategy",
  "description": "Strategy description",
  "category": "momentum",
  "risk_level": "medium",
  "file": <file>
}`}
                </pre>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Run Backtest</h4>
                <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                  {`POST /api/backtest/run
Content-Type: application/json

{
  "strategy_id": "strategy_id",
  "start_date": "2020-01-01",
  "end_date": "2023-12-31",
  "initial_capital": 100000,
  "benchmark": "SPY"
}`}
                </pre>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  Get Backtest Results
                </h4>
                <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
                  {`GET /api/backtest/{backtest_id}/results

Response:
{
  "sharpe_ratio": 1.25,
  "max_drawdown": -0.15,
  "total_return": 0.45,
  "win_rate": 0.65,
  "equity_curve": [...],
  "trades": [...]
}`}
                </pre>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "strategy-development",
      title: "Strategy Development",
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white mb-6">
            Strategy Development Guide
          </h2>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              Best Practices
            </h3>
            <div className="space-y-4 text-gray-300">
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  1. Avoid Look-Ahead Bias
                </h4>
                <p>
                  Always use point-in-time data and ensure your strategy only
                  uses information available at the time of the decision.
                </p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  2. Handle Transaction Costs
                </h4>
                <p>
                  Account for slippage, commissions, and market impact in your
                  strategy logic.
                </p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  3. Risk Management
                </h4>
                <p>
                  Implement proper position sizing, stop losses, and portfolio
                  diversification.
                </p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  4. Data Quality
                </h4>
                <p>
                  Use high-quality, clean data and handle missing values
                  appropriately.
                </p>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              Example Strategy
            </h3>
            <pre className="bg-gray-900 p-4 rounded text-sm overflow-x-auto">
              {`import numpy as np
import pandas as pd

def initialize(context):
    # Set benchmark
    context.benchmark = symbol('SPY')
    
    # Strategy parameters
    context.lookback = 20
    context.threshold = 0.02
    
    # Schedule daily rebalancing
    schedule_function(rebalance, date_rules.every_day())

def handle_data(context, data):
    # Get historical prices
    prices = data.history(context.benchmark, 'price', 
                         context.lookback, '1d')
    
    # Calculate momentum
    returns = prices.pct_change()
    momentum = returns.mean()
    
    # Trading logic
    if momentum > context.threshold:
        order_target_percent(context.benchmark, 1.0)
    elif momentum < -context.threshold:
        order_target_percent(context.benchmark, 0.0)

def rebalance(context, data):
    # Daily rebalancing logic
    pass`}
            </pre>
          </div>
        </div>
      ),
    },
    {
      id: "datasets",
      title: "Datasets",
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white mb-6">
            Working with Datasets
          </h2>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              Available Datasets
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Market Data</h4>
                <ul className="text-gray-300 space-y-1">
                  <li>• OHLCV data</li>
                  <li>• Options chains</li>
                  <li>• Futures contracts</li>
                  <li>• Forex rates</li>
                </ul>
              </div>
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  Alternative Data
                </h4>
                <ul className="text-gray-300 space-y-1">
                  <li>• News sentiment</li>
                  <li>• Economic indicators</li>
                  <li>• Social media data</li>
                  <li>• Satellite imagery</li>
                </ul>
              </div>
            </div>

            <h3 className="text-xl font-semibold text-white mb-4">
              Uploading Custom Datasets
            </h3>
            <div className="space-y-4 text-gray-300">
              <p>
                Share your datasets with the community to help other researchers
                and traders.
              </p>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  Supported Formats
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>CSV files (.csv)</li>
                  <li>Parquet files (.parquet)</li>
                  <li>JSON files (.json)</li>
                  <li>Excel files (.xlsx)</li>
                </ul>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">
                  Dataset Requirements
                </h4>
                <ul className="list-disc list-inside space-y-1">
                  <li>Clear documentation and description</li>
                  <li>Data quality validation</li>
                  <li>Proper licensing information</li>
                  <li>Update frequency specification</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "community",
      title: "Community Features",
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white mb-6">
            Community Features
          </h2>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              Forum Discussions
            </h3>
            <div className="space-y-4 text-gray-300">
              <p>
                Connect with fellow quant traders through our community forum.
              </p>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    Ask Questions
                  </h4>
                  <p>
                    Get help with strategy development, backtesting, and
                    technical issues.
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    Share Insights
                  </h4>
                  <p>
                    Discuss market trends, research findings, and trading ideas.
                  </p>
                </div>
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    Showcase Work
                  </h4>
                  <p>Present your strategies and research to the community.</p>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-xl font-semibold text-white mb-4">
              Collaboration Tools
            </h3>
            <div className="space-y-4 text-gray-300">
              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Fork and Star</h4>
                <p>
                  Fork interesting strategies to create your own versions and
                  star your favorites.
                </p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Follow Users</h4>
                <p>
                  Follow other traders to stay updated on their latest
                  strategies and insights.
                </p>
              </div>

              <div className="bg-gray-700 rounded-lg p-4">
                <h4 className="font-semibold text-white mb-2">Team Projects</h4>
                <p>
                  Collaborate with other researchers on joint projects and
                  strategy development.
                </p>
              </div>
            </div>
          </div>
        </div>
      ),
    },
    {
      id: "faq",
      title: "FAQ",
      content: (
        <div className="space-y-6">
          <h2 className="text-3xl font-bold text-white mb-6">
            Frequently Asked Questions
          </h2>

          <div className="space-y-4">
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">
                General Questions
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    Q: Is Quant Hub free to use?
                  </h4>
                  <p className="text-gray-300">
                    A: Yes, Quant Hub offers a free tier with basic features.
                    Premium features are available with paid subscriptions.
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    Q: What programming languages are supported?
                  </h4>
                  <p className="text-gray-300">
                    A: We currently support Python for strategy development.
                    Support for other languages is planned for future releases.
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    Q: How accurate are the backtests?
                  </h4>
                  <p className="text-gray-300">
                    A: Our backtesting engine uses high-quality historical data
                    and accounts for transaction costs. However, past
                    performance doesn't guarantee future results.
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h3 className="text-xl font-semibold text-white mb-4">
                Technical Questions
              </h3>
              <div className="space-y-4">
                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    Q: How do I handle missing data in my strategy?
                  </h4>
                  <p className="text-gray-300">
                    A: Use data validation and handle missing values
                    appropriately. Our platform provides tools to identify and
                    handle data quality issues.
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    Q: Can I use external libraries in my strategies?
                  </h4>
                  <p className="text-gray-300">
                    A: Yes, you can use popular Python libraries like pandas,
                    numpy, scikit-learn, and others. Check our documentation for
                    the complete list.
                  </p>
                </div>

                <div className="bg-gray-700 rounded-lg p-4">
                  <h4 className="font-semibold text-white mb-2">
                    Q: How do I optimize my strategy parameters?
                  </h4>
                  <p className="text-gray-300">
                    A: Use our parameter optimization tools to find the best
                    combination of parameters while avoiding overfitting.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      ),
    },
  ];

  const sidebarItems = [
    { id: "getting-started", title: "Getting Started", icon: "🚀" },
    { id: "strategy-upload", title: "Strategy Upload", icon: "📤" },
    { id: "backtesting", title: "Backtesting", icon: "📊" },
    { id: "api-reference", title: "API Reference", icon: "🔧" },
    { id: "strategy-development", title: "Strategy Development", icon: "💻" },
    { id: "datasets", title: "Datasets", icon: "📁" },
    { id: "community", title: "Community Features", icon: "👥" },
    { id: "faq", title: "FAQ", icon: "❓" },
  ];

  const activeContent = docSections.find(
    (section) => section.id === activeSection
  );

  return (
    <div className="min-h-screen w-screen flex flex-col bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 text-white">
      <Header />
      <div className="flex-1 flex">
        {/* Sidebar */}
        <div className="w-64 bg-gray-800 border-r border-gray-700 p-6 overflow-y-auto">
          <h2 className="text-xl font-bold mb-6 text-blue-400">
            Documentation
          </h2>
          <nav className="space-y-2">
            {sidebarItems.map((item) => (
              <button
                key={item.id}
                onClick={() => setActiveSection(item.id)}
                className={`w-full text-left px-4 py-3 rounded-lg transition-colors ${
                  activeSection === item.id
                    ? "bg-blue-600 text-white"
                    : "text-gray-300 hover:bg-gray-700 hover:text-white"
                }`}
              >
                <span className="mr-3">{item.icon}</span>
                {item.title}
              </button>
            ))}
          </nav>
        </div>

        {/* Main Content */}
        <div className="flex-1 p-8 overflow-y-auto">
          <div className="max-w-4xl">{activeContent?.content}</div>
        </div>
      </div>
    </div>
  );
};

export default DocsPage;
