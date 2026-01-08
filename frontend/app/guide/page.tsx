"use client";

import Link from "next/link";
import { IoBalloonOutline } from "react-icons/io5";
import { BsSendArrowDown } from "react-icons/bs";
import { HiOutlineSave } from "react-icons/hi";
import { HiOutlineStar } from "react-icons/hi";
import { FaRegLightbulb } from "react-icons/fa6";
import { MdRecommend, MdOutlinePlace } from "react-icons/md";
import { PiMapPinLineFill } from "react-icons/pi";
import { HiOutlineArrowRight, HiOutlineArrowLeft } from "react-icons/hi";
import { RiFindReplaceLine } from "react-icons/ri";

export default function GuidePage() {
  const steps = [
    {
      number: 1,
      title: "참가자 수 선택",
      description: "2명, 3명, 또는 4명 중에서 선택하세요",
      icon: <IoBalloonOutline className="text-4xl text-blue-600" />,
      details: "상단의 '2명', '3명', '4명' 버튼을 클릭하여 참가자 수를 선택합니다.",
    },
    {
      number: 2,
      title: "출발지 입력",
      description: "각 참가자의 출발지를 입력하세요",
      icon: <MdOutlinePlace className="text-4xl text-blue-600" />,
      details: "A, B, C, D 라벨이 붙은 입력창에 출발지를 입력합니다. 최소 2글자 이상 입력하면 자동완성 목록이 나타납니다.",
    },
    {
      number: 3,
      title: "장소 선택",
      description: "자동완성 목록에서 정확한 장소를 선택하세요",
      icon: <RiFindReplaceLine className="text-4xl text-blue-600" />,
      details: "자동완성 목록에서 원하는 장소를 클릭하면 선택됩니다. 선택된 장소는 초록색으로 표시됩니다.",
    },
    {
      number: 4,
      title: "추천 받기",
      description: "모든 참가자의 출발지를 선택한 후 추천받기 버튼을 클릭하세요",
      icon: <MdRecommend className="text-4xl text-blue-600" />,
      details: "모든 참가자의 출발지가 선택되면 '추천받기' 버튼이 활성화됩니다. 클릭하면 최적의 만남 장소를 추천해드립니다.",
    },
    {
      number: 5,
      title: "결과 확인",
      description: "추천된 장소와 지도를 확인하세요",
      icon: <PiMapPinLineFill className="text-4xl text-blue-600" />,
      details: "최종 추천 장소와 후보 장소들을 확인할 수 있습니다. 지도에서 위치를 확인하고 카카오맵으로 이동할 수 있습니다.",
    },
  ];

  const features = [
    {
      icon: <BsSendArrowDown className="text-3xl text-blue-600" />,
      title: "공유하기",
      description: "추천 결과를 링크로 공유하여 친구들과 함께 확인할 수 있습니다.",
    },
    {
      icon: <HiOutlineSave className="text-3xl text-blue-600" />,
      title: "기록 저장",
      description: "로그인 후 추천 결과를 저장하여 나중에 다시 확인할 수 있습니다.",
    },
    {
      icon: <HiOutlineStar className="text-3xl text-blue-600" />,
      title: "즐겨찾기",
      description: "로그인 후 자주 가는 장소를 즐겨찾기에 추가하여 빠르게 접근할 수 있습니다.",
    },
  ];

  const tips = [
    {
      icon: <FaRegLightbulb className="text-2xl text-yellow-500" />,
      title: "자동완성 팁",
      description: "최소 2글자 이상 입력해야 자동완성이 표시됩니다. 500ms 디바운스가 적용되어 타이핑이 끝난 후 검색됩니다.",
    },
    {
      icon: <FaRegLightbulb className="text-2xl text-yellow-500" />,
      title: "정확한 장소 선택",
      description: "자동완성 목록에서 정확한 장소를 선택하면 더 정확한 추천을 받을 수 있습니다.",
    },
    {
      icon: <FaRegLightbulb className="text-2xl text-yellow-500" />,
      title: "무료 서비스",
      description: "완전 무료로 제공되는 서비스입니다. 자동완성 최적화로 빠르고 효율적으로 사용할 수 있습니다.",
    },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      {/* 헤더 */}
      <div className="text-center mb-12">
        <Link
          href="/"
          className="inline-flex items-center gap-2 mt-4 px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 border border-blue-300 rounded-lg hover:bg-blue-50 transition-colors mb-6"
        >
          <HiOutlineArrowLeft />
          홈으로 돌아가기
        </Link>
        <h1 className="text-5xl md:text-6xl font-bold gradient-text mb-4">사용 가이드</h1>
        <p className="text-lg text-slate-600">Meet-Middle을 처음 사용하시나요? 단계별로 따라해보세요!</p>
      </div>

      {/* 서비스 소개 */}
      <div className="bg-white rounded-xl p-8 shadow-lg border-2 border-blue-200 mb-8">
        <div className="text-center mb-6">
          <h2 className="text-3xl font-bold text-slate-800 mb-3">Meet-Middle이란?</h2>
          <p className="text-slate-600 text-lg">
            여러 명의 출발지를 입력하면, 최적의 만남 장소를 자동으로 추천해주는 서비스입니다.
            <br />
            지하철역, 문화시설, 공공기관, 관광명소 등 다양한 장소를 고려하여 추천합니다.
          </p>
        </div>
      </div>

      {/* 단계별 가이드 */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">사용 방법</h2>
        <div className="space-y-6">
          {steps.map((step, index) => (
            <div key={step.number} className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
              <div className="flex items-start gap-6">
                {/* 단계 번호 및 아이콘 */}
                <div className="flex-shrink-0">
                  <div className="relative">
                    <div className="w-16 h-16 rounded-full bg-gradient-to-r from-blue-500 to-blue-600 flex items-center justify-center text-white font-bold text-xl shadow-md">{step.number}</div>
                    <div className="absolute -bottom-2 -right-2 bg-white rounded-full p-2 border-2 border-blue-200">{step.icon}</div>
                  </div>
                </div>

                {/* 내용 */}
                <div className="flex-1">
                  <h3 className="text-2xl font-bold text-slate-800 mb-2">{step.title}</h3>
                  <p className="text-lg text-slate-600 mb-3 font-medium">{step.description}</p>
                  <p className="text-sm text-slate-500">{step.details}</p>
                </div>

                {/* 화살표 (마지막 단계 제외) */}
                {index < steps.length - 1 && (
                  <div className="flex-shrink-0 flex items-center justify-center mt-8">
                    <HiOutlineArrowRight className="text-3xl text-blue-400" />
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 주요 기능 */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">주요 기능</h2>
        <div className="grid md:grid-cols-3 gap-6">
          {features.map((feature, index) => (
            <div key={index} className="bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200 text-center transition-all duration-500 hover:-translate-y-[20px] hover:bg-blue-100">
              <div className="flex justify-center mb-4">{feature.icon}</div>
              <h3 className="text-xl font-bold text-slate-800 mb-3">{feature.title}</h3>
              <p className="text-sm text-slate-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>

      {/* 팁 */}
      <div className="mb-12">
        <h2 className="text-3xl font-bold text-slate-800 mb-8 text-center">유용한 팁</h2>
        <div className="space-y-4">
          {tips.map((tip, index) => (
            <div key={index} className="bg-blue-50 border border-blue-200 rounded-xl p-6">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0">{tip.icon}</div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-blue-900 mb-2">{tip.title}</h3>
                  <p className="text-sm text-blue-800">{tip.description}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* 시작하기 버튼 */}
      <div className="text-center">
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-bold text-lg rounded-lg hover:from-blue-600 hover:to-blue-700 transition-all shadow-lg hover:shadow-xl transform hover:-translate-y-0.5"
        >
          지금 시작하기
          <HiOutlineArrowRight />
        </Link>
      </div>

      {/* 추가 안내 */}
      <div className="mt-12 bg-white rounded-xl p-6 shadow-lg border-2 border-blue-200">
        <div className="text-center">
          <h3 className="text-xl font-bold text-slate-800 mb-4">궁금한 점이 있으신가요?</h3>
          <p className="text-slate-600 mb-4">서비스 사용 중 문제가 발생하거나 문의사항이 있으시면 언제든지 연락해주세요.</p>
          <div className="flex flex-wrap justify-center gap-4 text-sm text-slate-500">
            <span>✓ 완전 무료</span>
            <span>✓ 빠른 검색</span>
            <span>✓ 정확한 추천</span>
            <span>✓ 쉬운 사용</span>
          </div>
        </div>
      </div>
    </div>
  );
}
