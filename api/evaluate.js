// Vercel Serverless Function 版 - 完整5000字标准
export default async function handler(req, res) {
  // 1. 只允许 POST
  if (req.method !== 'POST') {
    return res.status(405).json({ error: '只支持 POST 请求' });
  }

  try {
    // 2. 从请求体中获取文书内容
    const { essay } = req.body;
    
    if (!essay || typeof essay !== 'string') {
      return res.status(400).json({ error: '无效的文书内容' });
    }

    // 3. 完整的系统标准
    const systemPrompt = `你是一个冷酷的逻辑审计官，负责扫描文书中的“思维伪装”。你的目标不是寻找优点，而是清点“智慧活跃度”指标下的违规原句。

[评分硬准则]

违规计数 >= 2处：判定为 1-2分（高风险）。

违规计数 = 1处：判定为 3分（合格）。

违规计数 = 0处（且有具体反思证据）：判定为 5分（有亮点）。

[违规判定清单（计件点）]

违规项 A（被动感慨）：出现 "inspired me"、"made me realize"、"opened my eyes"、"deeply moved" 等描述认知的被动触发词。

违规项 B（逻辑真空）：直接给出宏大结论（如：我明白了历史的力量），但没有拆解“之前怎么想、为什么错、如何修正”的具体思维路径。

违规项 C（陈词滥调）：使用人尽皆知的常识作为“深刻发现”（如：发现团队合作很重要、发现和平很珍贵）。

[强制执行步骤]

清点原句：从文书中找出所有符合上述违规项的原句，逐一列出。

硬性统计：根据违规原句总数，直接锚定分值。

封杀缓冲词：严禁使用“虽然、但是、整体而言、有潜力”等词汇。

输出格式（必须严格遵守）
指标：智慧活跃度

违规原句清点：

[引用原句1] | 违规类型：[A/B/C]

[引用原句2] | 违规类型：[A/B/C]
(若无违规请写：无)

违规总数： [N]

最终评分： [N] 分（[高风险/合格/有亮点]）

判定逻辑： [一句话陈述，严禁赞美。例如：因违规项达到2处，强制降级至高风险。]`;
    
    // 4. 调用 Moonshot API
    const response = await fetch('https://api.moonshot.cn/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${process.env.MOONSHOT_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'moonshot-v1-32k',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: `请根据以上标准审计这篇文书：\n\n${essay}` },
        ],
        temperature: 0.3,
        max_tokens: 8000,
      }),
    });

    if (!response.ok) {
      throw new Error(`Moonshot API 调用失败: ${response.status}`);
    }

    const data = await response.json();
    const analysis = data.choices[0].message.content;

    // 5. 返回结果
    res.status(200).json({ analysis });
  } catch (error) {
    console.error('评估过程出错:', error);
    res.status(500).json({ error: '评估失败: ' + error.message });
  }
}








