# 项目安全检查清单

以下是帮助项目作者 CelestialVisionary 降低安全风险的详细检查清单：

## 1. 敏感信息管理

- [ ] 检查所有代码文件，确保没有硬编码的敏感信息（数据库凭证、API密钥、JWT密钥等）
- [ ] 确认所有敏感配置都通过环境变量（.env文件）管理
- [ ] 检查 .gitignore 文件，确保包含以下内容：
  ```
  .env
  .env.local
  .env.development.local
  .env.production.local
  ```
- [ ] 考虑使用 git-secrets 工具扫描提交历史中的敏感信息
  ```bash
  # 安装 git-secrets
  git clone https://github.com/awslabs/git-secrets.git
  cd git-secrets
  make install

  # 配置 git-secrets
  git secrets --install
  git secrets --register-aws
  git secrets --add 'AKIA[0-9A-Z]{16}'
  git secrets --add 'password|secret|key|token'

  # 扫描提交历史
  git secrets --scan-history
  ```
- [ ] 对于生产环境，使用密钥管理服务（如AWS KMS、HashiCorp Vault）存储敏感信息

## 2. 权限控制强化

- [ ] 检查 userSecurityController.js 文件，添加角色验证确保只有管理员可以配置IP白名单
  ```javascript
  // 示例代码
  const addIpToWhitelist = async (req, res) => {
    // 添加角色验证
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: '权限不足，只有管理员可以配置IP白名单' });
    }
    // 现有逻辑...
  };
  ```
- [ ] 实施最小权限原则，创建多个角色（如admin、editor、viewer）并分配相应权限
- [ ] 启用多因素认证（MFA）保护管理员账号
  ```javascript
  // 可以使用 speakeasy 库实现TOTP认证
  const speakeasy = require('speakeasy');

  // 生成密钥
  const secret = speakeasy.generateSecret({ length: 20 });

  // 验证令牌
  const verified = speakeasy.totp.verify({
    secret: user.secretKey,
    encoding: 'base32',
    token: req.body.token
  });
  ```
- [ ] 定期轮换管理员密码和API密钥

## 3. 安全机制完善

- [ ] 实现真实的异地登录检测功能
  ```javascript
  // 修改 suspiciousActivityDetector.js
  const detect异地登录 = (user, loginIP) => {
    // 获取用户最近登录的IP地址
    const lastLoginIP = user.lastLoginIP;
    if (!lastLoginIP) return false;

    // 使用IP地理位置API判断是否异地登录
    // 注意：实际应用中需要调用真实的IP地理位置服务
    return lastLoginIP !== loginIP;
  };
  ```
- [ ] 实现不活跃时间段登录检测
  ```javascript
  // 修改 suspiciousActivityDetector.js
  const detect不活跃时间段登录 = (loginTime) => {
    const hour = new Date(loginTime).getHours();
    // 定义不活跃时间段（如凌晨1点到5点）
    return hour >= 1 && hour <= 5;
  };
  ```
- [ ] 建立多渠道告警机制
  ```javascript
  // 修改 securityAlertsService.js
  const sendSecurityAlert = async (user, alertType, details) => {
    // 发送邮件告警
    await sendEmailAlert(user.email, alertType, details);

    // 发送短信告警（如果用户提供了手机号）
    if (user.phoneNumber) {
      await sendSmsAlert(user.phoneNumber, alertType, details);
    }

    // 记录告警日志
    await logAlert(user.id, alertType, details);
  };
  ```
- [ ] 配置定期运行 npm audit 的脚本
  ```bash
  # 创建 audit.sh 文件
  #!/bin/bash
  cd d:\backstage management system\backend
  npm audit
  npm audit fix
  
  cd ../frontend
  npm audit
  npm audit fix
  ```
- [ ] 考虑使用 Snyk 或 Dependabot 自动监控依赖漏洞

## 4. 合规性保障

- [ ] 确保用户隐私数据处理符合相关法规要求（GDPR、个人信息保护法等）
- [ ] 为项目添加明确的开源许可声明（在 README.md 中）
  ```markdown
  ## 开源许可
  本项目采用 [MIT 许可证](https://opensource.org/licenses/MIT) 开源。
  ```
- [ ] 创建隐私政策文档（privacy_policy.md）
  ```markdown
  # 隐私政策

  ## 数据收集
  我们收集以下类型的数据：
  - 用户账户信息（用户名、邮箱等）
  - 登录日志（IP地址、用户代理等）
  - 使用数据（功能使用频率等）

  ## 数据使用
  我们收集的数据仅用于：
  - 提供和改进服务
  - 确保系统安全
  - 满足法律要求

  ## 数据保护
  我们采取以下措施保护您的数据：
  - 数据加密存储
  - 严格的访问控制
  - 定期安全审计
  ```
- [ ] 在用户注册和登录时获取数据处理同意
- [ ] 提供数据删除功能

## 实施计划

1. **立即实施**（1-3天）：
   - 敏感信息检查与清理
   - .gitignore 文件更新
   - IP白名单功能的权限控制修复

2. **短期实施**（1-2周）：
   - 多因素认证实现
   - 异地登录和不活跃时间段登录检测
   - 依赖漏洞扫描与更新

3. **长期实施**（2-4周）：
   - 完善多渠道告警机制
   - 创建隐私政策和许可声明
   - 定期安全审计流程建立

项目作者可以根据此检查清单逐步实施安全措施，降低项目维护过程中的安全风险。