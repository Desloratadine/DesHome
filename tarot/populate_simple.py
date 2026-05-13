#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
简化版塔罗牌图片预填充脚本
自动执行预填充操作，无需用户交互
"""

import os
import shutil
import re

def extract_ids_from_datajs():
    """从data.js文件中提取所有塔罗牌ID"""
    ids = []
    try:
        with open('data.js', 'r', encoding='utf-8') as f:
            content = f.read()
        
        # 使用正则表达式匹配所有id字段
        pattern = r"id:\s*'([^']+)'"
        matches = re.findall(pattern, content)
        ids.extend(matches)
        
        print(f"从data.js中提取到 {len(ids)} 个ID")
        return ids
        
    except FileNotFoundError:
        print("错误: data.js 文件未找到，使用默认ID列表")
        return generate_default_ids()

def generate_default_ids():
    """生成默认的塔罗牌ID列表（78张标准牌）"""
    ids = []
    
    # 大阿卡纳 (22张): major_00 到 major_21
    for i in range(0, 22):
        ids.append(f"major_{i:02d}")
    
    # 小阿卡纳组
    suits = ['wands', 'cups', 'swords', 'pents']
    for suit in suits:
        # 每组14张: suit_01 到 suit_14
        for i in range(1, 15):
            ids.append(f"{suit}_{i:02d}")
    
    print(f"生成默认ID列表: {len(ids)} 个ID")
    return ids

def main():
    """主函数"""
    print("开始预填充塔罗牌图片文件...")
    print("=" * 50)
    
    script_dir = os.path.dirname(os.path.abspath(__file__))
    images_dir = os.path.join(script_dir, 'images')
    example_path = os.path.join(images_dir, 'example.jpg')
    
    # 检查example.jpg是否存在
    if not os.path.exists(example_path):
        print(f"错误: 示例图片文件未找到: {example_path}")
        print("请确保在images文件夹中存在example.jpg文件")
        # 尝试在当前目录查找其他示例文件
        for f in os.listdir(images_dir):
            if f.lower().endswith('.jpg'):
                example_path = os.path.join(images_dir, f)
                print(f"使用备选示例文件: {f}")
                break
        
        if not os.path.exists(example_path):
            print("错误: 无法找到任何jpg文件作为示例")
            return
    
    # 获取ID列表
    ids = extract_ids_from_datajs()
    
    # 统计
    total = len(ids)
    created = 0
    existing = 0
    
    print(f"总计需要创建: {total} 张牌")
    print("=" * 50)
    
    for card_id in ids:
        target_path = os.path.join(images_dir, f"{card_id}.jpg")
        
        if os.path.exists(target_path):
            # print(f"已存在: {card_id}.jpg")
            existing += 1
        else:
            try:
                shutil.copy2(example_path, target_path)
                print(f"创建: {card_id}.jpg")
                created += 1
            except Exception as e:
                print(f"错误: 创建 {card_id}.jpg 失败 - {e}")
    
    print("=" * 50)
    print(f"操作完成!")
    print(f"总计: {total} 张牌")
    print(f"已创建: {created} 个新文件")
    print(f"已存在: {existing} 个文件")
    
    if created > 0:
        print("\n注意: 生成的图片文件均为示例图片的副本，")
        print("      在实际应用中应替换为真实的塔罗牌图片。")
    
    # 显示最终文件列表
    print("\n当前images文件夹中的文件数量:")
    jpg_files = [f for f in os.listdir(images_dir) if f.lower().endswith('.jpg')]
    print(f"总计 {len(jpg_files)} 个jpg文件")

if __name__ == '__main__':
    main()