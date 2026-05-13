#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
预填充塔罗牌图片文件脚本

该脚本将以 example.jpg 为基础，为所有塔罗牌ID创建相应的图片文件
用于开发和测试目的，在实际应用中应替换为真实的塔罗牌图片
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
        # 匹配格式: id: 'major_00', id: 'wands_01', 等
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

def populate_images():
    """基于example.jpg创建所有图片文件"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    images_dir = os.path.join(script_dir, 'images')
    example_path = os.path.join(images_dir, 'example.jpg')
    
    # 检查example.jpg是否存在
    if not os.path.exists(example_path):
        print(f"错误: 示例图片文件未找到: {example_path}")
        print("请确保在images文件夹中存在example.jpg文件")
        return False
    
    # 获取ID列表
    ids = extract_ids_from_datajs()
    
    # 统计
    total = len(ids)
    created = 0
    existing = 0
    
    print(f"开始创建图片文件 (总计: {total} 张牌)")
    print("=" * 50)
    
    for card_id in ids:
        target_path = os.path.join(images_dir, f"{card_id}.jpg")
        
        if os.path.exists(target_path):
            print(f"✓ 已存在: {card_id}.jpg")
            existing += 1
        else:
            try:
                shutil.copy2(example_path, target_path)
                print(f"✓ 创建: {card_id}.jpg")
                created += 1
            except Exception as e:
                print(f"✗ 错误: 创建 {card_id}.jpg 失败 - {e}")
    
    print("=" * 50)
    print(f"操作完成!")
    print(f"总计: {total} 张牌")
    print(f"已创建: {created} 个新文件")
    print(f"已存在: {existing} 个文件")
    
    if created > 0:
        print("\n注意: 生成的图片文件均为示例图片的副本，")
        print("      在实际应用中应替换为真实的塔罗牌图片。")
    
    return True

def list_images():
    """查看现有的图片文件"""
    script_dir = os.path.dirname(os.path.abspath(__file__))
    images_dir = os.path.join(script_dir, 'images')
    
    if not os.path.exists(images_dir):
        print(f"错误: images文件夹未找到: {images_dir}")
        return
    
    print("当前images文件夹中的文件:")
    print("-" * 50)
    
    jpg_files = [f for f in os.listdir(images_dir) if f.lower().endswith('.jpg')]
    jpg_files.sort()
    
    if not jpg_files:
        print("暂无图片文件")
    else:
        for i, filename in enumerate(jpg_files, 1):
            print(f"{i:3d}. {filename}")
    
    print(f"\n总计: {len(jpg_files)} 个图片文件")

def main():
    """主函数"""
    print("塔罗牌图片预填充脚本")
    print("版本: 1.0")
    print("=" * 50)
    
    print("1. 查看当前图片文件")
    print("2. 预填充图片文件")
    print("3. 显示帮助信息")
    print("=" * 50)
    
    try:
        choice = input("请选择操作 (1/2/3): ").strip()
        
        if choice == '1':
            list_images()
        elif choice == '2':
            if populate_images():
                print("\n预填充完成!")
        elif choice == '3':
            print("""
帮助信息:
- 此脚本用于为塔罗牌占卜项目预填充图片文件
- 脚本将以 example.jpg 作为模板，为所有塔罗牌ID创建jpg文件
- 所有生成的文件均可用于开发和测试，在实际使用中应替换为真实塔罗牌图片
- 脚本会自动从 data.js 文件中提取所有塔罗牌ID
- 如果某些ID对应的文件已存在，脚本将跳过而不重新创建
            """)
        else:
            print(f"错误: 无效的选择 '{choice}'，请输入 1, 2 或 3")
            
    except KeyboardInterrupt:
        print("\n\n操作已取消")
    except Exception as e:
        print(f"错误: {e}")

if __name__ == '__main__':
    main()