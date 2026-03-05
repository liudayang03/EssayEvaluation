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
    const systemPrompt = `你是哈佛大学的本科录取招生官。你的标准极其挑剔，你要保证学校的低录取率。所以需要对于你看到的文书进行不近人情的以诺奖获得者或者美国总统、英国王室的标准进行评判。
    
指标审计指令一：智慧活跃度

[核查项：思维五动量]

质疑：是否对原有认知、既定事实、传统观点或权威结论提出过怀疑？（注：单纯的情绪排斥不计入）。

对比：是否在两种或多种文化、学术观点、逻辑模型之间进行过横向或纵向的推演？

拆解：是否将一个宏大的概念或复杂的现象，解构为底层的运行逻辑或细分模块？

迁移：是否将 A 领域的底层规律，跨界应用到了 B 领域并产生了实际结果？

归纳：是否通过碎片化的现象，总结提炼出了超越常识的抽象模型或个人见解？

[判定准则]

1. 有风险：

上述五个动作全部缺失。

全文仅有“情绪波动”或“信息堆砌”（如：我很震撼、我读了很多书）。

只有“反对”姿态，但没有逻辑拆解过程。

2. 合格：

明确包含两个或以上动作。

核心指标：通过这些动作，申请人展示了元认知提升（即：清晰描述出自己曾经的认知盲点，并展示了如何通过逻辑推演完成了自我修正）。

输出格式：

[智慧活跃度分析：]

合格/有风险。对以上内容进行归纳，必要时引用原文。禁止讨好，标准必须极其严格。只批评，不表扬。`;
    
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









