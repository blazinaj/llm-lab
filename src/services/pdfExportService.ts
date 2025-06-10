import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { DetailedBenchmarkResult, LLMModel, BenchmarkTask } from '../types';
import { SavedBenchmark } from './databaseService';

// Extend jsPDF type to include autoTable
declare module 'jspdf' {
  interface jsPDF {
    autoTable: (options: any) => jsPDF;
  }
}

export class PDFExportService {
  private addHeader(doc: jsPDF, title: string) {
    // Header background
    doc.setFillColor(31, 41, 55); // gray-800
    doc.rect(0, 0, doc.internal.pageSize.width, 40, 'F');
    
    // Logo area (placeholder)
    doc.setFillColor(59, 130, 246); // blue-500
    doc.circle(20, 20, 8, 'F');
    
    // Title
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(24);
    doc.setFont(undefined, 'bold');
    doc.text('LLM Lab', 35, 18);
    
    // Subtitle
    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.text('AI Model Benchmarking Report', 35, 28);
    
    // Report title
    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.text(title, doc.internal.pageSize.width - 20, 20, { align: 'right' });
    
    // Reset colors
    doc.setTextColor(0, 0, 0);
    
    return 50; // Return Y position after header
  }

  private addFooter(doc: jsPDF) {
    const pageCount = doc.internal.pages.length - 1;
    const pageHeight = doc.internal.pageSize.height;
    
    for (let i = 1; i <= pageCount; i++) {
      doc.setPage(i);
      
      // Footer line
      doc.setDrawColor(229, 231, 235); // gray-200
      doc.line(20, pageHeight - 20, doc.internal.pageSize.width - 20, pageHeight - 20);
      
      // Page number and timestamp
      doc.setFontSize(10);
      doc.setTextColor(107, 114, 128); // gray-500
      doc.text(`Page ${i} of ${pageCount}`, 20, pageHeight - 10);
      doc.text(
        `Generated on ${new Date().toLocaleDateString()} at ${new Date().toLocaleTimeString()}`,
        doc.internal.pageSize.width - 20,
        pageHeight - 10,
        { align: 'right' }
      );
    }
  }

  private checkPageBreak(doc: jsPDF, yPos: number, requiredSpace: number = 50): number {
    if (yPos + requiredSpace > doc.internal.pageSize.height - 40) {
      doc.addPage();
      return 30;
    }
    return yPos;
  }

  private addSection(doc: jsPDF, title: string, yPos: number, color: number[] = [31, 41, 55]): number {
    yPos = this.checkPageBreak(doc, yPos, 30);
    
    doc.setFontSize(18);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(color[0], color[1], color[2]);
    doc.text(title, 20, yPos);
    
    return yPos + 15;
  }

  private formatScore(score: number): string {
    return `${(score * 100).toFixed(1)}%`;
  }

  private formatCost(cost: number): string {
    return cost < 0.001 ? `$${(cost * 1000).toFixed(3)}k` : `$${cost.toFixed(4)}`;
  }

  private formatLatency(latency: number): string {
    return `${(latency / 1000).toFixed(2)}s`;
  }

  private calculateStatistics(results: DetailedBenchmarkResult[]) {
    const successful = results.filter(r => !r.error);
    const failed = results.filter(r => r.error);
    
    if (successful.length === 0) {
      return {
        successRate: 0,
        avgScore: 0,
        maxScore: 0,
        minScore: 0,
        avgCost: 0,
        totalCost: 0,
        avgLatency: 0,
        minLatency: 0,
        maxLatency: 0,
        totalTokens: 0,
        avgInputTokens: 0,
        avgOutputTokens: 0,
        avgQuality: 0,
        topPerformer: null,
        mostEconomical: null,
        fastest: null,
        successful,
        failed
      };
    }
    
    const scores = successful.map(r => r.score);
    const costs = successful.map(r => r.cost);
    const latencies = successful.map(r => r.latency);
    const qualities = successful.map(r => r.quality);
    
    return {
      successRate: (successful.length / results.length) * 100,
      avgScore: scores.reduce((a, b) => a + b, 0) / scores.length,
      maxScore: Math.max(...scores),
      minScore: Math.min(...scores),
      avgCost: costs.reduce((a, b) => a + b, 0) / costs.length,
      totalCost: costs.reduce((a, b) => a + b, 0),
      avgLatency: latencies.reduce((a, b) => a + b, 0) / latencies.length,
      minLatency: Math.min(...latencies),
      maxLatency: Math.max(...latencies),
      totalTokens: successful.reduce((sum, r) => sum + r.inputTokens + r.outputTokens, 0),
      avgInputTokens: successful.reduce((sum, r) => sum + r.inputTokens, 0) / successful.length,
      avgOutputTokens: successful.reduce((sum, r) => sum + r.outputTokens, 0) / successful.length,
      avgQuality: qualities.reduce((a, b) => a + b, 0) / qualities.length,
      topPerformer: successful.sort((a, b) => b.score - a.score)[0],
      mostEconomical: successful.sort((a, b) => a.cost - b.cost)[0],
      fastest: successful.sort((a, b) => a.latency - b.latency)[0],
      successful,
      failed
    };
  }

  exportBenchmarkResults(
    results: DetailedBenchmarkResult[],
    models: LLMModel[],
    task: BenchmarkTask,
    benchmarkName?: string
  ): void {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Calculate comprehensive statistics
    const stats = this.calculateStatistics(results);
    const getModel = (modelId: string) => models.find(m => m.id === modelId);
    
    // Header
    let yPos = this.addHeader(doc, benchmarkName || 'Benchmark Results');

    // ===== EXECUTIVE SUMMARY SECTION =====
    yPos = this.addSection(doc, '📊 Executive Summary', yPos + 10, [59, 130, 246]);
    
    // Key Findings Box
    yPos = this.checkPageBreak(doc, yPos, 80);
    doc.setFillColor(240, 249, 255);
    doc.rect(20, yPos - 5, pageWidth - 40, 70, 'F');
    doc.setDrawColor(59, 130, 246);
    doc.rect(20, yPos - 5, pageWidth - 40, 70, 'S');
    
    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(30, 64, 175);
    doc.text('Key Findings', 25, yPos + 10);
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(55, 65, 81);
    
    const findings = [
      `• Success Rate: ${stats.successRate.toFixed(1)}% (${stats.successful.length}/${results.length} models)`,
      `• Top Performer: ${getModel(stats.topPerformer?.modelId)?.name || 'N/A'} (${this.formatScore(stats.maxScore)})`,
      `• Most Economical: ${getModel(stats.mostEconomical?.modelId)?.name || 'N/A'} (${this.formatCost(stats.mostEconomical?.cost || 0)})`,
      `• Fastest Response: ${getModel(stats.fastest?.modelId)?.name || 'N/A'} (${this.formatLatency(stats.minLatency)})`,
      `• Total Cost: ${this.formatCost(stats.totalCost)} | Avg per model: ${this.formatCost(stats.avgCost)}`,
      `• Performance Range: ${this.formatScore(stats.minScore)} - ${this.formatScore(stats.maxScore)}`
    ];
    
    findings.forEach((finding, index) => {
      doc.text(finding, 25, yPos + 25 + (index * 7));
    });
    
    yPos += 85;

    // ===== BENCHMARK OVERVIEW =====
    yPos = this.addSection(doc, '📋 Benchmark Overview', yPos, [107, 114, 128]);
    
    const overviewData = [
      ['Task Name', task.name],
      ['Task ID', task.id],
      ['Category', task.category.charAt(0).toUpperCase() + task.category.slice(1)],
      ['Difficulty Level', task.difficulty.charAt(0).toUpperCase() + task.difficulty.slice(1)],
      ['Models Tested', results.length.toString()],
      ['Successful Runs', stats.successful.length.toString()],
      ['Failed Runs', stats.failed.length.toString()],
      ['Date Generated', new Date().toLocaleDateString()],
      ['Time Generated', new Date().toLocaleTimeString()],
    ];
    
    doc.autoTable({
      startY: yPos,
      head: [['Attribute', 'Value']],
      body: overviewData,
      theme: 'grid',
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [107, 114, 128], textColor: 255 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 60 },
        1: { cellWidth: 80 }
      },
      margin: { left: 20, right: 20 }
    });
    
    yPos = doc.lastAutoTable.finalY + 20;

    // ===== PERFORMANCE STATISTICS =====
    yPos = this.addSection(doc, '📈 Performance Statistics', yPos, [16, 185, 129]);
    
    const performanceData = [
      ['Average Score', this.formatScore(stats.avgScore), 'Overall performance across all models'],
      ['Highest Score', this.formatScore(stats.maxScore), `Achieved by ${getModel(stats.topPerformer?.modelId)?.name || 'N/A'}`],
      ['Lowest Score', this.formatScore(stats.minScore), 'Minimum performance recorded'],
      ['Score Range', `${this.formatScore(stats.maxScore - stats.minScore)}`, 'Performance spread across models'],
      ['Average Quality', this.formatScore(stats.avgQuality), 'Content quality assessment'],
      ['Models ≥90%', stats.successful.filter(r => r.score >= 0.9).length.toString(), 'High-performing models'],
      ['Models ≥80%', stats.successful.filter(r => r.score >= 0.8).length.toString(), 'Good-performing models'],
      ['Models <60%', stats.successful.filter(r => r.score < 0.6).length.toString(), 'Underperforming models']
    ];
    
    doc.autoTable({
      startY: yPos,
      head: [['Metric', 'Value', 'Notes']],
      body: performanceData,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [16, 185, 129], textColor: 255 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 90 }
      },
      margin: { left: 20, right: 20 }
    });
    
    yPos = doc.lastAutoTable.finalY + 20;

    // ===== COST & EFFICIENCY ANALYSIS =====
    yPos = this.addSection(doc, '💰 Cost & Efficiency Analysis', yPos, [245, 158, 11]);
    
    const costData = [
      ['Total Cost', this.formatCost(stats.totalCost), 'Sum of all successful benchmark runs'],
      ['Average Cost', this.formatCost(stats.avgCost), 'Mean cost per model'],
      ['Lowest Cost', this.formatCost(stats.mostEconomical?.cost || 0), `${getModel(stats.mostEconomical?.modelId)?.name || 'N/A'}`],
      ['Highest Cost', this.formatCost(Math.max(...stats.successful.map(r => r.cost))), 'Most expensive run'],
      ['Cost Range', this.formatCost(Math.max(...stats.successful.map(r => r.cost)) - (stats.mostEconomical?.cost || 0)), 'Price difference span'],
      ['Budget Models', stats.successful.filter(r => r.cost < 0.01).length.toString(), 'Models under $0.01'],
      ['Premium Models', stats.successful.filter(r => r.cost > 0.05).length.toString(), 'Models over $0.05'],
      ['Best Value', getModel(stats.successful.sort((a, b) => (b.score / b.cost) - (a.score / a.cost))[0]?.modelId)?.name || 'N/A', 'Highest score-to-cost ratio']
    ];
    
    doc.autoTable({
      startY: yPos,
      head: [['Metric', 'Value', 'Notes']],
      body: costData,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [245, 158, 11], textColor: 255 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 90 }
      },
      margin: { left: 20, right: 20 }
    });
    
    yPos = doc.lastAutoTable.finalY + 20;

    // ===== RESPONSE TIME ANALYSIS =====
    yPos = this.addSection(doc, '⚡ Response Time Analysis', yPos, [168, 85, 247]);
    
    const timingData = [
      ['Average Latency', this.formatLatency(stats.avgLatency), 'Mean response time across models'],
      ['Fastest Response', this.formatLatency(stats.minLatency), `${getModel(stats.fastest?.modelId)?.name || 'N/A'}`],
      ['Slowest Response', this.formatLatency(stats.maxLatency), 'Longest response time recorded'],
      ['Time Range', this.formatLatency(stats.maxLatency - stats.minLatency), 'Speed difference span'],
      ['Sub-2s Models', stats.successful.filter(r => r.latency < 2000).length.toString(), 'Very fast responders'],
      ['Sub-5s Models', stats.successful.filter(r => r.latency < 5000).length.toString(), 'Fast responders'],
      ['Over-10s Models', stats.successful.filter(r => r.latency > 10000).length.toString(), 'Slow responders'],
      ['Speed Category', stats.avgLatency < 5000 ? 'Fast' : stats.avgLatency < 10000 ? 'Moderate' : 'Slow', 'Overall benchmark speed']
    ];
    
    doc.autoTable({
      startY: yPos,
      head: [['Metric', 'Value', 'Notes']],
      body: timingData,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [168, 85, 247], textColor: 255 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 90 }
      },
      margin: { left: 20, right: 20 }
    });
    
    yPos = doc.lastAutoTable.finalY + 20;

    // ===== TOKEN USAGE ANALYSIS =====
    yPos = this.addSection(doc, '🔤 Token Usage Analysis', yPos, [236, 72, 153]);
    
    const tokenData = [
      ['Total Tokens', stats.totalTokens.toLocaleString(), 'Input + Output tokens combined'],
      ['Avg Input Tokens', Math.round(stats.avgInputTokens).toLocaleString(), 'Mean input tokens per model'],
      ['Avg Output Tokens', Math.round(stats.avgOutputTokens).toLocaleString(), 'Mean output tokens per model'],
      ['Max Output', Math.max(...stats.successful.map(r => r.outputTokens)).toLocaleString(), 'Highest token generation'],
      ['Min Output', Math.min(...stats.successful.map(r => r.outputTokens)).toLocaleString(), 'Lowest token generation'],
      ['Verbose Models', stats.successful.filter(r => r.outputTokens > stats.avgOutputTokens * 1.5).length.toString(), 'Above-average output length'],
      ['Concise Models', stats.successful.filter(r => r.outputTokens < stats.avgOutputTokens * 0.5).length.toString(), 'Below-average output length'],
      ['Token Efficiency', (stats.avgScore / (stats.avgInputTokens + stats.avgOutputTokens) * 1000).toFixed(2), 'Score per 1000 tokens']
    ];
    
    doc.autoTable({
      startY: yPos,
      head: [['Metric', 'Value', 'Notes']],
      body: tokenData,
      theme: 'striped',
      styles: { fontSize: 10, cellPadding: 4 },
      headStyles: { fillColor: [236, 72, 153], textColor: 255 },
      columnStyles: {
        0: { fontStyle: 'bold', cellWidth: 50 },
        1: { cellWidth: 30, halign: 'center' },
        2: { cellWidth: 90 }
      },
      margin: { left: 20, right: 20 }
    });
    
    yPos = doc.lastAutoTable.finalY + 20;

    // ===== TASK PROMPT DETAILS =====
    doc.addPage();
    yPos = 30;
    yPos = this.addSection(doc, '📝 Task Prompt & Configuration', yPos, [55, 65, 81]);
    
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(55, 65, 81);
    doc.text('Full Task Prompt:', 20, yPos);
    
    yPos += 10;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    doc.setDrawColor(200, 200, 200);
    doc.rect(20, yPos - 5, pageWidth - 40, 2, 'F');
    
    yPos += 5;
    const promptLines = doc.splitTextToSize(task.prompt, pageWidth - 40);
    doc.text(promptLines, 20, yPos);
    yPos += promptLines.length * 5 + 15;
    
    if (task.expectedOutput) {
      yPos = this.checkPageBreak(doc, yPos, 30);
      doc.setFontSize(12);
      doc.setFont(undefined, 'bold');
      doc.text('Expected Output Pattern:', 20, yPos);
      yPos += 10;
      
      const expectedLines = doc.splitTextToSize(task.expectedOutput, pageWidth - 40);
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.text(expectedLines, 20, yPos);
      yPos += expectedLines.length * 5 + 15;
    }

    // ===== DETAILED MODEL PERFORMANCE =====
    yPos = this.addSection(doc, '🏆 Detailed Model Performance', yPos, [220, 38, 127]);
    
    const sortedResults = [...stats.successful].sort((a, b) => b.score - a.score);
    
    const detailedData = sortedResults.map((result, index) => {
      const model = getModel(result.modelId);
      const efficiency = result.cost > 0 ? (result.score / result.cost * 1000).toFixed(0) : 'N/A';
      
      return [
        `#${index + 1}`,
        model?.name || result.modelId,
        model?.provider || 'Unknown',
        this.formatScore(result.score),
        this.formatScore(result.quality),
        this.formatLatency(result.latency),
        this.formatCost(result.cost),
        result.inputTokens.toLocaleString(),
        result.outputTokens.toLocaleString(),
        efficiency
      ];
    });
    
    doc.autoTable({
      startY: yPos,
      head: [['Rank', 'Model', 'Provider', 'Score', 'Quality', 'Latency', 'Cost', 'In Tokens', 'Out Tokens', 'Efficiency']],
      body: detailedData,
      theme: 'striped',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [220, 38, 127], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 15, halign: 'center' },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 18, halign: 'center' },
        4: { cellWidth: 18, halign: 'center' },
        5: { cellWidth: 18, halign: 'center' },
        6: { cellWidth: 18, halign: 'center' },
        7: { cellWidth: 20, halign: 'center' },
        8: { cellWidth: 20, halign: 'center' },
        9: { cellWidth: 18, halign: 'center' }
      },
      margin: { left: 20, right: 20 }
    });
    
    yPos = doc.lastAutoTable.finalY + 20;

    // ===== ERROR ANALYSIS =====
    if (stats.failed.length > 0) {
      yPos = this.addSection(doc, '❌ Error Analysis', yPos, [239, 68, 68]);
      
      const errorData = stats.failed.map((result) => {
        const model = getModel(result.modelId);
        return [
          model?.name || result.modelId,
          model?.provider || 'Unknown',
          result.error || 'Unknown error',
          'Failed'
        ];
      });
      
      doc.autoTable({
        startY: yPos,
        head: [['Model', 'Provider', 'Error Message', 'Status']],
        body: errorData,
        theme: 'striped',
        styles: { fontSize: 9, cellPadding: 3 },
        headStyles: { fillColor: [239, 68, 68], textColor: 255 },
        columnStyles: {
          0: { cellWidth: 40 },
          1: { cellWidth: 30 },
          2: { cellWidth: 80 },
          3: { cellWidth: 20, halign: 'center' }
        },
        margin: { left: 20, right: 20 }
      });
      
      yPos = doc.lastAutoTable.finalY + 20;
    }

    // ===== RECOMMENDATIONS =====
    yPos = this.addSection(doc, '💡 Recommendations', yPos, [59, 130, 246]);
    
    yPos = this.checkPageBreak(doc, yPos, 60);
    
    const recommendations = [];
    
    if (stats.topPerformer) {
      recommendations.push(`🏆 For best overall performance: ${getModel(stats.topPerformer.modelId)?.name} (${this.formatScore(stats.topPerformer.score)})`);
    }
    
    if (stats.mostEconomical) {
      recommendations.push(`💰 For budget-conscious applications: ${getModel(stats.mostEconomical.modelId)?.name} (${this.formatCost(stats.mostEconomical.cost)})`);
    }
    
    if (stats.fastest) {
      recommendations.push(`⚡ For speed-critical applications: ${getModel(stats.fastest.modelId)?.name} (${this.formatLatency(stats.fastest.latency)})`);
    }
    
    const bestValue = stats.successful.sort((a, b) => (b.score / b.cost) - (a.score / a.cost))[0];
    if (bestValue) {
      recommendations.push(`📊 For best value proposition: ${getModel(bestValue.modelId)?.name} (efficiency: ${(bestValue.score / bestValue.cost * 1000).toFixed(0)})`);
    }
    
    recommendations.push(`📈 Performance spread: ${((stats.maxScore - stats.minScore) * 100).toFixed(1)} percentage points difference between best and worst`);
    recommendations.push(`💵 Budget impact: Cost ranges from ${this.formatCost(stats.mostEconomical?.cost || 0)} to ${this.formatCost(Math.max(...stats.successful.map(r => r.cost)))}`);
    
    if (stats.successRate < 100) {
      recommendations.push(`⚠️ ${stats.failed.length} model(s) failed - check API configurations and rate limits`);
    }
    
    doc.setFontSize(11);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(55, 65, 81);
    
    recommendations.forEach((rec, index) => {
      yPos = this.checkPageBreak(doc, yPos, 15);
      doc.text(rec, 20, yPos);
      yPos += 12;
    });

    // ===== COMPLETE MODEL OUTPUTS =====
    doc.addPage();
    yPos = 30;
    yPos = this.addSection(doc, '📄 Complete Model Outputs', yPos, [34, 197, 94]);
    
    sortedResults.forEach((result, index) => {
      const model = getModel(result.modelId);
      
      yPos = this.checkPageBreak(doc, yPos, 80);
      
      // Model header
      doc.setFillColor(245, 245, 245);
      doc.rect(20, yPos - 5, pageWidth - 40, 25, 'F');
      doc.setDrawColor(156, 163, 175);
      doc.rect(20, yPos - 5, pageWidth - 40, 25, 'S');
      
      doc.setFontSize(14);
      doc.setFont(undefined, 'bold');
      doc.setTextColor(31, 41, 55);
      doc.text(`${index + 1}. ${model?.name || result.modelId}`, 25, yPos + 8);
      
      doc.setFontSize(10);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(107, 114, 128);
      doc.text(`Provider: ${model?.provider || 'Unknown'} | Score: ${this.formatScore(result.score)} | Cost: ${this.formatCost(result.cost)} | Time: ${this.formatLatency(result.latency)}`, 25, yPos + 18);
      
      yPos += 35;
      
      // Output content
      doc.setFontSize(9);
      doc.setFont(undefined, 'normal');
      doc.setTextColor(55, 65, 81);
      
      let output = result.rawOutput || result.output || 'No output available';
      
      // Split output into manageable chunks
      const outputLines = doc.splitTextToSize(output, pageWidth - 40);
      
      // Add output with page breaks as needed
      let currentLine = 0;
      while (currentLine < outputLines.length) {
        yPos = this.checkPageBreak(doc, yPos, 20);
        
        const remainingSpace = Math.floor((doc.internal.pageSize.height - yPos - 30) / 4);
        const linesToAdd = Math.min(remainingSpace, outputLines.length - currentLine);
        
        if (linesToAdd > 0) {
          doc.text(outputLines.slice(currentLine, currentLine + linesToAdd), 20, yPos);
          yPos += linesToAdd * 4;
          currentLine += linesToAdd;
        }
        
        if (currentLine < outputLines.length) {
          doc.addPage();
          yPos = 30;
        }
      }
      
      yPos += 20;
    });

    // ===== TECHNICAL APPENDIX =====
    doc.addPage();
    yPos = 30;
    yPos = this.addSection(doc, '🔧 Technical Appendix', yPos, [107, 114, 128]);
    
    // Model specifications
    const uniqueModels = [...new Set(results.map(r => r.modelId))];
    const modelSpecs = uniqueModels.map(modelId => {
      const model = getModel(modelId);
      if (!model) return null;
      
      return [
        model.name,
        model.provider,
        `${(model.contextWindow / 1000).toFixed(0)}K`,
        `$${(model.inputPricePerToken * 1000000).toFixed(2)}/M`,
        `$${(model.outputPricePerToken * 1000000).toFixed(2)}/M`,
        `${(model.maxOutputTokens / 1000).toFixed(1)}K`,
        model.capabilities.join(', ')
      ];
    }).filter(Boolean);
    
    doc.autoTable({
      startY: yPos,
      head: [['Model', 'Provider', 'Context', 'Input Price', 'Output Price', 'Max Output', 'Capabilities']],
      body: modelSpecs,
      theme: 'grid',
      styles: { fontSize: 8, cellPadding: 3 },
      headStyles: { fillColor: [107, 114, 128], textColor: 255 },
      columnStyles: {
        0: { cellWidth: 30 },
        1: { cellWidth: 25 },
        2: { cellWidth: 20 },
        3: { cellWidth: 25 },
        4: { cellWidth: 25 },
        5: { cellWidth: 20 },
        6: { cellWidth: 45 }
      },
      margin: { left: 20, right: 20 }
    });
    
    yPos = doc.lastAutoTable.finalY + 20;
    
    // Methodology notes
    yPos = this.checkPageBreak(doc, yPos, 40);
    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(55, 65, 81);
    doc.text('Methodology & Scoring', 20, yPos);
    
    yPos += 15;
    doc.setFontSize(10);
    doc.setFont(undefined, 'normal');
    
    const methodologyText = [
      'Scoring Methodology:',
      '• Overall Score: Weighted combination of quality assessment (80%) and response speed (20%)',
      '• Quality Assessment: Based on response coherence, task relevance, and completeness',
      '• Cost Calculation: Input tokens × input price + output tokens × output price',
      '• Efficiency Ratio: Performance score divided by cost, multiplied by 1000 for readability',
      '• Latency: Time from request initiation to complete response receipt',
      '',
      'Quality Evaluation Criteria:',
      '• Task-specific content analysis (coding patterns, logical structure, creativity)',
      '• Response length appropriateness (not too brief, not excessively verbose)',
      '• Coherence and readability assessment',
      '• Error detection and handling',
      '',
      'Notes:',
      '• All API calls made directly to respective providers',
      '• Timestamps recorded in UTC',
      '• Costs calculated using current published pricing at time of execution',
      '• Failed requests excluded from statistical calculations unless otherwise noted'
    ];
    
    methodologyText.forEach(line => {
      yPos = this.checkPageBreak(doc, yPos, 12);
      doc.text(line, 20, yPos);
      yPos += line === '' ? 6 : 12;
    });

    // Add footer to all pages
    this.addFooter(doc);
    
    // Save the PDF
    const fileName = benchmarkName 
      ? `${benchmarkName.replace(/[^a-z0-9]/gi, '_')}_comprehensive_report.pdf`
      : `llm_benchmark_comprehensive_${new Date().toISOString().slice(0, 10)}.pdf`;
    
    doc.save(fileName);
  }

  exportBenchmarkHistory(
    benchmark: SavedBenchmark,
    results: DetailedBenchmarkResult[],
    models: LLMModel[],
    task: BenchmarkTask
  ): void {
    this.exportBenchmarkResults(results, models, task, benchmark.name);
  }
}

export const pdfExportService = new PDFExportService();